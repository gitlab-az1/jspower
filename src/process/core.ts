import { spawn, ChildProcess, StdioPipe, StdioNull } from 'node:child_process';
import { Readable, Writable } from 'node:stream';
import assert from 'node:assert';

import { errnoMessage, exitCodeInfo, noop, parseDuration, psTree } from './_utils';
import { Exception } from '../errors/exception';
import type { Duration } from './_types';


const processCwd = Symbol('$processCwd');

export type Options = {
  [processCwd]: string;
  cwd?: string;
  verbose: boolean;
  env: NodeJS.ProcessEnv;
  shell: string | boolean;
  prefix: string;
  spawn: typeof spawn;
}


const defaultOptions: Options = {
  [processCwd]: process.cwd(),
  cwd: process.cwd(),
  verbose: false,
  env: process.env,
  shell: false,
  prefix: '',
  spawn,
};


export type Shell = ((pieces: TemplateStringsArray, ...args: any[]) => Promise<ProcessOutput>);

type Resolve = ((out: ProcessOutput) => void);
type IO = StdioPipe | StdioNull;

export class Process {
  private _child?: ChildProcess;
  private _command = '';
  private _from = '';
  private _snapshot: Options = defaultOptions;
  private _resolve: Resolve = noop;
  private _reject: Resolve = noop;
  private _stdio: [IO, IO, IO] = ['inherit', 'pipe', 'pipe'];
  private _nothrow = false;
  private _quiet = false;
  private _timeout?: number;
  private _timeoutSignal?: string;
  private _resolved = false;
  private _halted = false;
  private _piped = false;
  _prerun = noop;
  _postrun = noop;

  public get child(): ChildProcess | undefined {
    return this._child;
  }

  public get cwd(): string {
    return this._snapshot.cwd || '';
  }

  constructor(command: string | string[], from?: string, options?: Partial<Options>) {
    this._quiet; //#
    if (Array.isArray(command)) {
      command = command.join(' ');
    }

    this._bind(
      command,
      from || process.cwd(),
      noop,
      noop,
      { ...defaultOptions, ...options },
    );
  }

  public cd(dir: string): Process {
    this._snapshot.cwd = dir;

    if(this._snapshot.verbose) {
      console.log(`[node subprocess]$ cd ${dir}`);
    }

    return this;
  }

  private _bind(
    cmd: string,
    from: string,
    resolve: Resolve,
    reject: Resolve,
    options: Options,
  ) {
    this._command = cmd;
    this._from = from;
    this._resolve = resolve;
    this._reject = reject;
    this._snapshot = { ...options };
  }

  public run(): Promise<ProcessOutput> {
    return new Promise<ProcessOutput>((resolve, reject) => {
      if(this._child && this._child instanceof ChildProcess) return reject(new Exception('Process is already running'));

      this._bind(this._command, this._from, resolve, reject, this._snapshot);
      this._prerun();

      let stdout = '',
        stderr = '',
        combined = '';

      this._child = spawn(this._command, {
        stdio: this._stdio,
        cwd: this._snapshot.cwd ?? this._snapshot[processCwd],
        env: this._snapshot.env,
        timeout: this._timeout,
        shell: this._snapshot.shell,
      });

      const onStdout = (data: any) => {
        // $.log({ kind: 'stdout', data, verbose: this._snapshot.verbose && !this._quiet });
        stdout += data;
        combined += data;
      };

      const onStderr = (data: any) => {
        // $.log({ kind: 'stderr', data, verbose: this._snapshot..verbose && !this._quiet });
        stderr += data;
        combined += data;
      };

      if(!this._piped) {
        this._child.stdout?.on('data', onStdout); // If process is piped, don't collect or print output.
      }

      this._child.stderr?.on('data', onStderr); // Stderr should be printed regardless of piping.

      this._child.on('close', (code, signal) => {
        let message = `exit code: ${code}`;

        if(code != 0 || signal != null) {
          message = `${stderr || '\n'}    at ${this._from}`;
          message += `\n    exit code: ${code}${
            exitCodeInfo(code) ? ' (' + exitCodeInfo(code) + ')' : ''
          }`;

          if(signal != null) {
            message += `\n    signal: ${signal}`;
          }
        }

        const output = new ProcessOutput(
          code,
          signal,
          stdout,
          stderr,
          combined,
          message,
        );

        if(code === 0 || this._nothrow) {
          this._resolve(output);
        } else {
          this._reject(output);
        }
        
        this._resolved = true;
      });

      this._child.on('error', (err: NodeJS.ErrnoException) => {
        const message =
          `${err.message}\n` +
          `    errno: ${err.errno} (${errnoMessage(err.errno)})\n` +
          `    code: ${err.code}\n` +
          `    at ${this._from}`;
        this._reject(
          new ProcessOutput(null, null, stdout, stderr, combined, message),
        );

        this._resolved = true;
      });

      this._postrun(); // In case $1.pipe($2), after both subprocesses are running, we can pipe $1.stdout to $2.stdin.

      if(this._timeout && this._timeoutSignal) {
        /*const t = */setTimeout(() => this.kill(this._timeoutSignal), this._timeout);
      }
    });
  }

  public pipe(dest: Writable | Process): Process {
    if (typeof dest == 'string') {
      throw new Error('The pipe() method does not take strings. Forgot $?');
    }

    if (this._resolved) {
      if (dest instanceof Process) {
        dest.stdin.end(); // In case of piped stdin, we may want to close stdin of dest as well.
      }

      throw new Exception('The pipe() method shouldn\'t be called after promise is already resolved!');
    }
    this._piped = true;

    if(dest instanceof Process) {
      dest.stdio('pipe');
      dest._prerun = this.run.bind(this);
      dest._postrun = () => {

        if(!dest.child) {
          throw new Exception('Access to stdin of pipe destination without creation a subprocess.');
        }

        this.stdout.pipe(dest.stdin);
      };

      return dest;
    } else {
      this._postrun = () => this.stdout.pipe(dest);
      return this;
    }
  }

  public async kill(signal = 'SIGTERM'): Promise<void> {
    if(!this._child) {
      throw new Exception('Trying to kill a process without creating one.');
    }

    if(!this._child.pid) {
      throw new Exception('The process pid is undefined.');
    }

    const children: any = await psTree(this._child.pid);

    for(const p of children) {
      try {
        process.kill(+p.PID, signal);
      } catch {
        // ignore error
      }
    }
    try {
      process.kill(this._child.pid, signal);
    } catch {
      // ignore error
    }
  }

  get stdin(): Writable {
    this.stdio('pipe');
    this.run();
    assert(this._child);

    if(this._child.stdin == null) {
      throw new Error('The stdin of subprocess is null.');
    }

    return this._child.stdin;
  }

  get stdout(): Readable {
    this.run();
    assert(this._child);

    if(this._child.stdout == null) {
      throw new Error('The stdout of subprocess is null.');
    }

    return this._child.stdout;
  }

  get stderr(): Readable {
    this.run();
    assert(this._child);
    
    if(this._child.stderr == null) {
      throw new Error('The stderr of subprocess is null.');
    }

    return this._child.stderr;
  }

  public stdio(stdin: IO, stdout: IO = 'pipe', stderr: IO = 'pipe'): Process {
    this._stdio = [stdin, stdout, stderr];
    return this;
  }

  public nothrow(): Process {
    this._nothrow = true;
    return this;
  }

  public quiet(): Process {
    this._quiet = true;
    return this;
  }

  public timeout(d: Duration, signal = 'SIGTERM'): Process {
    this._timeout = parseDuration(d);
    this._timeoutSignal = signal;
    return this;
  }

  public halt(): Process {
    this._halted = true;
    return this;
  }

  public get isHalted(): boolean {
    return this._halted;
  }

  public get cmd(): string {
    return this._command;
  }
}


export class ProcessOutput extends Error {
  private readonly _code: number | null;
  private readonly _signal: NodeJS.Signals | null;
  private readonly _stdout: string;
  private readonly _stderr: string;
  private readonly _combined: string;

  constructor(
    code: number | null,
    signal: NodeJS.Signals | null,
    stdout: string,
    stderr: string,
    combined: string,
    message: string // eslint-disable-line comma-dangle
  ) {
    super(message);
    this._code = code;
    this._signal = signal;
    this._stdout = stdout;
    this._stderr = stderr;
    this._combined = combined;
  }

  public toString() {
    return this._combined;
  }

  public get stdout() {
    return this._stdout;
  }

  public get stderr() {
    return this._stderr;
  }

  public get exitCode() {
    return this._code;
  }

  public get signal() {
    return this._signal;
  }
}


/**
 * Run shell commands
 * @param pieces 
 * @param params 
 * @returns 
 */
export function $(pieces: TemplateStringsArray, ...params: any[]): Promise<ProcessOutput> {
  const cmd = params.reduce((f, c, i) => `${f}${c}${pieces[i + 1]}`, pieces[0]);
  const proc = new Process(cmd, undefined, {
    shell: true,
    verbose: true,
  });

  proc.stdio('inherit', 'pipe', 'pipe');

  console.log(`[node subprocess]$ ${cmd}`);
  return proc.run();
}