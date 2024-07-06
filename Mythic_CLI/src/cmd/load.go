package cmd

import (
	"fmt"
	"github.com/MythicMeta/Mythic_CLI/cmd/internal"
	"github.com/spf13/cobra"
)

// configCmd represents the config command
var loadCmd = &cobra.Command{
	Use:   "load",
	Short: "Load tar versions of Mythic images from ./saved_images/mythic_save.tar",
	Long:  `Run this command to load TAR files for exported images generated via the 'save' command.`,
	Run:   load,
}

func init() {
	rootCmd.AddCommand(loadCmd)
}

func load(cmd *cobra.Command, args []string) {
	if err := internal.DockerLoad(); err != nil {
		fmt.Printf("%v\n", err)
	} else {
		fmt.Printf("[+] Successfully loaded image(s)!\n")
	}
}
