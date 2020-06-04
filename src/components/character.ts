import Inline from "./inline";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { storeData } from "../decorate";

class Character extends Inline {
  type = ComponentType.character;
  structureType = StructureType.none;
  content: string;

  constructor(content: string, style?: storeData, data?: storeData) {
    super(style, data);
    this.content = content;
  }

  getRaw() {
    return {
      type: this.type,
      content: this.content
    };
  }

  render() {
    return this.content;
  }
}

export default Character;
