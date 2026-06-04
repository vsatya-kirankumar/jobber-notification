import * as shell from 'shelljs';

// Copy the emails directory from src to build
shell.cp('-R', 'src/emails', 'build/src/');