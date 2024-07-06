package internal

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

func runGitClone(args []string) error {
	if lookPath, err := exec.LookPath("git"); err != nil {
		fmt.Printf("[-] git is not installed or not available in the current PATH variable")
		return err
	} else if exe, err := os.Executable(); err != nil {
		fmt.Printf("[-] Failed to get lookPath to current executable")
		return err
	} else {
		exePath := filepath.Dir(exe)
		// git -c http.sslVerify=false clone --recurse-submodules --single-branch --branch $2 $1 temp

		command := exec.Command(lookPath, args...)
		command.Dir = exePath
		//command.Env = getMythicEnvList()

		if stdout, err := command.StdoutPipe(); err != nil {
			fmt.Printf("[-] Failed to get stdout pipe for running git")
			return err
		} else if stderr, err := command.StderrPipe(); err != nil {
			fmt.Printf("[-] Failed to get stderr pipe for running git")
			return err
		} else {
			stdoutScanner := bufio.NewScanner(stdout)
			stderrScanner := bufio.NewScanner(stderr)
			go func() {
				for stdoutScanner.Scan() {
					fmt.Printf("%s\n", stdoutScanner.Text())
				}
			}()
			go func() {
				for stderrScanner.Scan() {
					fmt.Printf("%s\n", stderrScanner.Text())
				}
			}()
			if err = command.Start(); err != nil {
				fmt.Printf("[-] Error trying to start git: %v\n", err)
				return err
			} else if err = command.Wait(); err != nil {
				fmt.Printf("[-] Error trying to run git: %v\n", err)
				return err
			}
		}
	}
	return nil
}
func runGitLsRemote(args []string) (err error) {
	if lookPath, err := exec.LookPath("git"); err != nil {
		fmt.Printf("[-] git is not installed or not available in the current PATH variable")
		return err
	} else if exe, err := os.Executable(); err != nil {
		fmt.Printf("[-] Failed to get lookPath to current executable")
		return err
	} else {
		exePath := filepath.Dir(exe)
		// git -c http.sslVerify=false clone --recurse-submodules --single-branch --branch $2 $1 temp
		//  git ls-remote URL HEAD
		command := exec.Command(lookPath, args...)
		command.Dir = exePath
		//command.Env = getMythicEnvList()
		command.Env = append(command.Env, "GIT_TERMINAL_PROMPT=0")

		if err = command.Run(); err != nil {
			fmt.Printf("[-] Error trying to start git: %v\n", err)
			return err
		} else {
			return nil
		}
	}
}
