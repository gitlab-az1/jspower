

/**
 * @package ps-tree
 * @copyright indexzero
 * @see https://github.com/indexzero/ps-tree/tree/master
 */

'use strict';

import { spawn } from 'node:child_process';
import es from 'event-stream';

export default function childrenOfPid(pid: any, callback: any) {
  let headers: any = null;

  if(typeof callback !== 'function') {
    throw new Error('childrenOfPid(pid, callback) expects callback');
  }

  if(typeof pid === 'number') {
    pid = pid.toString();
  }

  //
  // The `ps-tree` module behaves differently on *nix vs. Windows
  // by spawning different programs and parsing their output.
  //
  // Linux:
  // 1. " <defunct> " need to be striped
  // ```bash
  // $ ps -A -o comm,ppid,pid,stat
  // COMMAND          PPID   PID STAT
  // bbsd             2899 16958 Ss
  // watch <defunct>  1914 16964 Z
  // ps              20688 16965 R+
  // ```
  //
  // Darwin:
  // $ ps -A -o comm,ppid,pid,stat
  // COMM              PPID   PID STAT
  // /sbin/launchd        0     1 Ss
  // /usr/libexec/Use     1    43 Ss
  //
  // Win32:
  // 1. wmic PROCESS WHERE ParentProcessId=4604 GET Name,ParentProcessId,ProcessId,Status)
  // 2. The order of head columns is fixed
  // ```shell
  // > wmic PROCESS GET Name,ProcessId,ParentProcessId,Status
  // Name                          ParentProcessId  ProcessId   Status
  // System Idle Process           0                0
  // System                        0                4
  // smss.exe                      4                228
  // ```

  let processLister;
  if (process.platform === 'win32') {
    // See also: https://github.com/nodejs/node-v0.x-archive/issues/2318
    processLister = spawn('wmic.exe', ['PROCESS', 'GET', 'Name,ProcessId,ParentProcessId,Status']);
  } else {
    processLister = spawn('ps', ['-A', '-o', 'ppid,pid,stat,comm']);
  }

  (es as any).connect(
    // spawn('ps', ['-A', '-o', 'ppid,pid,stat,comm']).stdout,
    processLister.stdout,
    es.split(),
    es.map(function (line: any, cb: any) { //this could parse alot of unix command output
      const columns = line.trim().split(/\s+/);
      if (!headers) {
        headers = columns;

        //
        // Rename Win32 header name, to as same as the linux, for compatible.
        //
        headers = headers.map(normalizeHeader);
        return cb();
      }

      const row = {};
      // For each header
      const h = headers.slice();
      while (h.length) {
        (row as any)[h.shift()] = h.length ? columns.shift() : columns.join(' ');
      }

      return cb(null, row);
    }),

    es.writeArray(function (err: any, ps: any) {
      err; // #
      const parents = {},
        children: any = [];

      (parents as any)[pid] = true;
      ps.forEach(function (proc: any) {
        if ((parents as any)[proc.PPID]) {
          (parents as any)[proc.PID] = true;
          children.push(proc);
        }
      });

      callback(null, children);
    }),
  ).on('error', callback);
}

/**
 * Normalizes the given header `str` from the Windows
 * title to the *nix title.
 *
 * @param {string} str Header string to normalize
 */
function normalizeHeader(str: string) {
  switch (str) {
    case 'Name':  // for win32
    case 'COMM':  // for darwin
      return 'COMMAND';
      break;
    case 'ParentProcessId':
      return 'PPID';
      break;
    case 'ProcessId':
      return 'PID';
      break;
    case 'Status':
      return 'STAT';
      break;
    default:
      return str;
  }
}