package cmd

import (
	"fmt"
	"github.com/MythicMeta/Mythic_CLI/cmd/internal"
	"github.com/spf13/cobra"
	"os"
)

// installCmd represents the config command
var installGitHubCmd = &cobra.Command{
	Use:     "github url [branch] [-f]",
	Short:   "install services from GitHub or other Git-based repositories",
	Long:    `Run this command to install services from Git-based repositories by doing a git clone`,
	Aliases: []string{"git"},
	Run:     installGitHub,
	Args:    cobra.RangeArgs(1, 2),
}

func init() {
	installCmd.AddCommand(installGitHubCmd)
	installGitHubCmd.Flags().BoolVarP(
		&force,
		"force",
		"f",
		false,
		`Force installing from GitHub and don't prompt to overwrite files if an older version is already installed`,
	)
	installGitHubCmd.Flags().StringVarP(
		&branch,
		"branch",
		"b",
		"",
		`Install a specific branch from GitHub instead of the main/master branch`,
	)
}

func installGitHub(cmd *cobra.Command, args []string) {
	if len(args) == 2 {
		branch = args[1]
	}
	if err := internal.InstallService(args[0], branch, force); err != nil {
		fmt.Printf("[-] Failed to install service: %v\n", err)
		os.Exit(1)
	} else {
		fmt.Printf("[+] Successfully installed service!\n")
	}
}
