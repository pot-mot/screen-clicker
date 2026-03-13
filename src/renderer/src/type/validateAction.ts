// typescript-json-schema .\src\main\Action.ts Action --required
// FIX UiohookMouseEvent button number
import { createSchemaValidator } from '@renderer/utils/type/typeGuard.ts'
import { JSONSchemaType } from 'ajv/lib/types/json-schema.ts'
import { Action } from '@renderer/type/Action.ts'

const Action_JsonSchema: JSONSchemaType<Action> = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "anyOf": [
        {
            "properties": {
                "button": {
                    "$ref": "#/definitions/ButtonType"
                },
                "event": {
                    "$ref": "#/definitions/UiohookMouseEvent"
                },
                "timestamp": {
                    "type": "number"
                },
                "type": {
                    "const": "mousedown",
                    "type": "string"
                }
            },
            "required": [
                "button",
                "event",
                "timestamp",
                "type"
            ],
            "type": "object"
        },
        {
            "properties": {
                "button": {
                    "$ref": "#/definitions/ButtonType"
                },
                "event": {
                    "$ref": "#/definitions/UiohookMouseEvent"
                },
                "timestamp": {
                    "type": "number"
                },
                "type": {
                    "const": "mouseup",
                    "type": "string"
                }
            },
            "required": [
                "button",
                "event",
                "timestamp",
                "type"
            ],
            "type": "object"
        },
        {
            "properties": {
                "event": {
                    "$ref": "#/definitions/UiohookMouseEvent"
                },
                "timestamp": {
                    "type": "number"
                },
                "type": {
                    "const": "mousemove",
                    "type": "string"
                }
            },
            "required": [
                "event",
                "timestamp",
                "type"
            ],
            "type": "object"
        },
        {
            "properties": {
                "event": {
                    "$ref": "#/definitions/UiohookKeyboardEvent"
                },
                "key": {
                    "type": "string"
                },
                "timestamp": {
                    "type": "number"
                },
                "type": {
                    "const": "keydown",
                    "type": "string"
                }
            },
            "required": [
                "event",
                "key",
                "timestamp",
                "type"
            ],
            "type": "object"
        },
        {
            "properties": {
                "event": {
                    "$ref": "#/definitions/UiohookKeyboardEvent"
                },
                "key": {
                    "type": "string"
                },
                "timestamp": {
                    "type": "number"
                },
                "type": {
                    "const": "keyup",
                    "type": "string"
                }
            },
            "required": [
                "event",
                "key",
                "timestamp",
                "type"
            ],
            "type": "object"
        },
        {
            "properties": {
                "event": {
                    "$ref": "#/definitions/UiohookKeyboardEvent"
                },
                "timestamp": {
                    "type": "number"
                },
                "type": {
                    "const": "unicodeTab",
                    "type": "string"
                },
                "value": {
                    "type": "string"
                }
            },
            "required": [
                "event",
                "timestamp",
                "type",
                "value"
            ],
            "type": "object"
        },
        {
            "properties": {
                "event": {
                    "$ref": "#/definitions/UiohookWheelEvent"
                },
                "timestamp": {
                    "type": "number"
                },
                "type": {
                    "const": "wheel",
                    "type": "string"
                }
            },
            "required": [
                "event",
                "timestamp",
                "type"
            ],
            "type": "object"
        },
        {
            "properties": {
                "duration": {
                    "type": "number"
                },
                "timestamp": {
                    "type": "number"
                },
                "type": {
                    "const": "sleep",
                    "type": "string"
                }
            },
            "required": [
                "duration",
                "timestamp",
                "type"
            ],
            "type": "object"
        }
    ],
    "definitions": {
        "ButtonType": {
            "enum": [
                "left",
                "middle",
                "right"
            ],
            "type": "string"
        },
        "EventType.EVENT_MOUSE_WHEEL": {
            "const": 11,
            "type": "number"
        },
        "UiohookKeyboardEvent": {
            "properties": {
                "altKey": {
                    "type": "boolean"
                },
                "ctrlKey": {
                    "type": "boolean"
                },
                "keycode": {
                    "type": "number"
                },
                "metaKey": {
                    "type": "boolean"
                },
                "shiftKey": {
                    "type": "boolean"
                },
                "time": {
                    "type": "number"
                },
                "type": {
                    "enum": [
                        4,
                        5
                    ],
                    "type": "number"
                }
            },
            "required": [
                "altKey",
                "ctrlKey",
                "keycode",
                "metaKey",
                "shiftKey",
                "time",
                "type"
            ],
            "type": "object"
        },
        "UiohookMouseEvent": {
            "properties": {
                "altKey": {
                    "type": "boolean"
                },
                "button": {
                    "type": 'number'
                },
                "clicks": {
                    "type": "number"
                },
                "ctrlKey": {
                    "type": "boolean"
                },
                "metaKey": {
                    "type": "boolean"
                },
                "shiftKey": {
                    "type": "boolean"
                },
                "time": {
                    "type": "number"
                },
                "type": {
                    "enum": [
                        6,
                        7,
                        8,
                        9
                    ],
                    "type": "number"
                },
                "x": {
                    "type": "number"
                },
                "y": {
                    "type": "number"
                }
            },
            "required": [
                "altKey",
                "button",
                "clicks",
                "ctrlKey",
                "metaKey",
                "shiftKey",
                "time",
                "type",
                "x",
                "y"
            ],
            "type": "object"
        },
        "UiohookWheelEvent": {
            "properties": {
                "altKey": {
                    "type": "boolean"
                },
                "amount": {
                    "type": "number"
                },
                "clicks": {
                    "type": "number"
                },
                "ctrlKey": {
                    "type": "boolean"
                },
                "direction": {
                    "$ref": "#/definitions/WheelDirection"
                },
                "metaKey": {
                    "type": "boolean"
                },
                "rotation": {
                    "type": "number"
                },
                "shiftKey": {
                    "type": "boolean"
                },
                "time": {
                    "type": "number"
                },
                "type": {
                    "$ref": "#/definitions/EventType.EVENT_MOUSE_WHEEL"
                },
                "x": {
                    "type": "number"
                },
                "y": {
                    "type": "number"
                }
            },
            "required": [
                "altKey",
                "amount",
                "clicks",
                "ctrlKey",
                "direction",
                "metaKey",
                "rotation",
                "shiftKey",
                "time",
                "type",
                "x",
                "y"
            ],
            "type": "object"
        },
        "WheelDirection": {
            "enum": [
                3,
                4
            ],
            "type": "number"
        }
    }
}

export const validateAction = createSchemaValidator(Action_JsonSchema)
