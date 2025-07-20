# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Track history in each item
- Changelog added
- ui-Dasboard Widget with graphical display of queues

### Fixed

- _path integrate now the stackid

### Changed

- Tooltip in ui-pst-table on each row includes full _history with path movements.

### Removed

nothing




## [1.0.25] - 2025-07-19

### Added

- ui-pst-table node: custom dashboard widget with styled HTML table for stack visualization
- Display enhancements: tooltip on hover with creation/modification dates.
- autoUpdate flag in pst-supervisor to optionally emit updates at each event.


### Fixed

- Stack file persistence now ensures folder structure is created before write.
- Readme format corrections
- node-red scorecard now ok:
	* Nodes have unique names
	* Bugs URL supplied
	* Nodes have examples
	* Node.js Version added

### Changed

- added suffix 'pst-' in each nodes. Nodes have now unique names : 
	* pst-stack
	* pst-push
	* pst-shift
	* pst-peek
	* pst-clearstack
	* pst-supervisor
	* pst-transfert

### Removed

nothing


## [1.0.5] - 2025-07-18

### Added

- Initial release with core nodes:
	* stack
	* push
	* shift
	* peek
	* clearstack
	* supervisor
	* transfert
- Persistent JSON-based FIFO stack 
- MQTT Event and Superivsion added