# 🧱 Virtual Process Flow Stack for Node-RED
## Description

Manage persistent FIFO queues for industrial process flows using Node-RED. \
With full MQTT support, file persistence, and dashboard integration.\

WARNING : Minimum Node-RED Version 4+ \

** For pedagogical purposes only. Commercial or industrial use is not recommended. **

NPM Repository: [npmjs @uopoc/node-red-processstack] (https://www.npmjs.com/package/@uopoc/node-red-processstack/)
GIT Repository: [github @uopoc/node-red-processstack] (https://github.com/uopoc/node-red-processstack)
RED Node: [Node-Red @uopoc/node-red-processstack] (https://flows.nodered.org/node/@uopoc/node-red-processstack)


** WARNING ** : 
* Minimum Node-RED Version 4+
* Minimum NodeJS Version 18+



Copyright © 2025, [Université d'Orléans](https://www.univ-orleans.fr)\
Licence MIT - see [LICENCE](./LICENCE) file included with this package \



## 🧰 Main Features
- **Persistent FIFO** (First-In First-Out) stacks
- **MQTT commands & events** Optional
- **dashboard UI** ready using a specific node
- Structured by **Process / Cell / Stack**



## 🔧 Available Nodes

| Node         | Description |
|--------------|-------------|
| `pst-push`       | Adds an item to the stack |
| `pst-shift`      | Removes the first item from the stack |
| `pst-transfert`  | Moves an item from a source stack to a target stack |
| `pst-peek` 	   | Same as shift but without removing item |
| `pst-supervisor` | Returns the entire stack contents |
| `pst-clearstack` | Empties the stack completely |
| `ui-pst-table` | in Dashboard panel: display the content of the stack in the dashboard |

## 🛠️ Configuration Nodes

| Node                  			| Description 						|
|-----------------------------------|-----------------------------------|
| `pst-stack` *(config)*              	| Defines a persistent FIFO stack 	|
| `pst-manufacturingcell` *(config)* 	| Defines a production cell 		|
| `pst-processflow` *(config)*       	| Defines a production line  		|


## 💾 Persistence
Each stack is **automatically saved to disk** after every modification:\
/data/pststacks/<processid>/<cellid>/<stackid>.json

## Installation

```
npm install @uopoc/node-red-processstack
```

## ChangeLog
[Voir le changelog](./CHANGELOG.md)

## Nodes details
### PUSH Node
Add (push) an item to the FIFO Stack
* **Input**:
 Object with :
	- id Required, string or number (max 128 chars). Allowed characters: a-z, A-Z, 0-9, _, -, 
	- userdata : Required, must be an object with any metadata you want to store (can be empty object)
**Rm**: msg.payload can also be an item provided by the pull node\
**Exemple**:\
	msg.payload = {\
	  "id": "ITEM-001",\
	  "userdata": { "batch": "B001", "weight": 2.5 }\
	} 
* **Output**: 
Object with :
	msg.payload = true/false\
	msg.item = {\
		  _itemid: uniqueid (UID),\
		  _created: creation timestamp (ms from 1970),\
		  _updated: last update timestamp,\
		  id: id providen in the input,\
		  userdata: userdata provided at the Input\
	msg.error = {\
		  code, \
		  string\
	}\
	msg.stackdata:{\
		  processid, \
		  processname, \
		  company, \
		  department, \
		  location, \
		  cellid, \
		  cellname, \
		  manufacturer, \
		  model, \
		  stackid, \
		  stackname\
	}

### SHIFT Node
Remove (shift) an item from the FIFO Stack
* input: Dummy message to triger the node
* output: (same as peek or msg.item provided by the output of push node)

### PEEK Node
Get (whithout shift) an item from the FIFO Stack
* input: Dummy message to triger the node
* output: (same as shift or msg.item provided by the output of push node)

### TRANSFERT Node
Transfert (pull/push) an item from a stack to another

### CLEAR Node
Delete all items from the FIFO Stack

### SUPERVISOR Node
Get items list from the FIFO Stack. \ 
Check the autoupdate checkbox in the node property in order to update the status every stack change.\ 
use the ui-pst-table or a ui-template node in order to display the stack in a dashboard.

### UI-PST-TABLE Node
In Dashboard panel: display the content of the stack in the dashboard\ 
Should be connected to the second output of the supervisor node.\ 
It can replace a ui-template node

## MQTT
You can connect the stack config node to a mqttClient and provide 3 topics:
* **Command**: (not implemented) Input command (push, shift, clear, peek)
* **Events**: Every event (push, shift, clear, etc.) will emit message
* **Superv**: Emits complete stack state and profile after event


### Superv
Please configure the topic and the mqtt client in the stack config Node
after each operation, a mqtt message is send to the specified topic: \
**Content**:
* path: (string) processid/stackid, 
* profil: {...}, 
* stack: [item1,...] 
* count: Number of item in the stack 
* length: Maximum number of item in the stack

### Events
Please configure the topic and the mqtt client in the stack config Node\
after each operation, a mqtt message is send to the specified topic: \
**Content**: 
* path: (string) processid/stackid,
* event: (string) type of activity (push, shift, clear...)
* item: (object) item
* count: (number) Number of item in the stack
* length: (number) Maximum number of item in the stack

### Command
Not Implemented Yet

## About Us
* **Company**: Université d'Orléans – France  
* **Department**: Polytech Orléans (Engineering School of the University of Orléans)  
* **Specialization**: Industrial Engineering applied to cosmetics, pharmaceuticals, and food industries [Learn more about our program](https://www.univ-orleans.fr/en/polytech/departments/les-7-specialites-dingenieures-de-lecole/industrial-engineering-applied) 
* **Facility**: Teaching Factory – *Polyfactory* 


