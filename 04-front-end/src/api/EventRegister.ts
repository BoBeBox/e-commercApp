import EventEmitter from "eventemitter3";

const eventRegister = new EventEmitter();

type EventType = "AUTH_EVENT"|"CART_EVENT";

type EventHandler = (...args: any[]) => void;

const EventRegister = {
  on: (event: EventType, fn: EventHandler) => eventRegister.on(event, fn),
  once: (event: EventType, fn: EventHandler) => eventRegister.once(event, fn),
  off: (event: EventType, fn: EventHandler) => eventRegister.off(event, fn),
  emit: (event: EventType, payload: any) => eventRegister.emit(event, payload)
}

Object.freeze(EventRegister);

export default EventRegister;