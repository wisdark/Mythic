package databaseStructs

import (
	"database/sql"
	"time"
)

type Payloadtype struct {
	ID                     int                  `db:"id"`
	Name                   string               `db:"name"`
	MythicEncrypts         bool                 `db:"mythic_encrypts"`
	CreationTime           time.Time            `db:"creation_time"`
	FileExtension          string               `db:"file_extension"`
	Wrapper                bool                 `db:"wrapper"`
	SupportedOs            MythicJSONArray      `db:"supported_os"`
	ContainerRunning       bool                 `db:"container_running"`
	Service                string               `db:"service"`
	Author                 string               `db:"author"`
	Note                   string               `db:"note"`
	SupportsDynamicLoading bool                 `db:"supports_dynamic_loading"`
	Deleted                bool                 `db:"deleted"`
	TranslationContainerID sql.NullInt64        `db:"translation_container_id"`
	Translationcontainer   Translationcontainer `db:"translationcontainer"`
	ContainerCount         int                  `db:"container_count"`
	MessageFormat          string               `db:"message_format"`
	AgentType              string               `db:"agent_type"`
}
