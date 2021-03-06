import { Map } from "immutable";
import Decorate from "../decorate";
import Record from "../record";
import Block from "./block";
import Collection from "./collection";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import updateComponent from "../util/update-component";
import { getId } from "./util";
import { storeData } from "../decorate/index";
import { recordMethod } from "../record/decorators";
import { getContentBuilder } from "../content";
import { createError } from "../util/handle-error";

export type operatorType = [Block, number, number] | undefined;
export type classType = { exchangeOnly: Function; exchange: Function };
export interface IRawType {
  id?: string;
  type: ComponentType | string;
  children?: IRawType[];
  style?: storeData;
  data?: storeData;
  // for CharacterList
  content?: string;
  // for Media or InlineImage
  src?: string;
  // for Media
  mediaType?: string;
  // fro Header
  headerType?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  // for List
  listType?: "ul" | "ol" | "nl";
  // for Table
  row?: number;
  col?: number;
  needHead?: boolean;
  // for TableRaw
  cellType?: "th" | "td";
  size?: number;
  // for code
  language?: string;
  tag?: string;
}
export interface ISnapshoot {
  style: Map<string, string>;
  data: Map<string, string>;
}

abstract class Component {
  id: string = getId();
  parent?: Collection<Component>;
  // 修饰：样式，数据等
  decorate: Decorate;
  record: Record;
  // 类型，用于保存和恢复数据
  // 方便外部扩展组件
  abstract type: ComponentType | string;
  // 结构上的作用
  abstract structureType: StructureType;
  // 默认的数据和样式
  data: storeData = {};
  style: storeData = {};

  constructor(style: storeData = {}, data: storeData = {}) {
    this.decorate = new Decorate(this, style, data);
    this.record = new Record(this);
  }

  // 获取用于存储的内容
  getRaw(): IRawType {
    let raw: IRawType = {
      type: this.type
    };
    if (!this.decorate.styleIsEmpty()) {
      raw.style = this.decorate.copyStyle();
    }
    if (!this.decorate.dataIsEmpty()) {
      raw.data = this.decorate.copyData();
    }
    return raw;
  }

  // 修改组件的表现形式
  @recordMethod
  modifyDecorate(
    style?: storeData,
    data?: storeData,
    customerUpdate: boolean = false
  ) {
    this.decorate.mergeStyle(style);
    this.decorate.mergeData(data);
    if (this instanceof Block) {
      getContentBuilder().setUpdateDecorate();
      updateComponent(this, customerUpdate);
    }
    return;
  }

  // 记录当前状态
  recordSnapshoot() {
    this.record.store();
  }

  // 获得当前组件的快照，用于撤销和回退
  snapshoot(): ISnapshoot {
    return {
      style: this.decorate.style,
      data: this.decorate.data
    };
  }

  // 回退组件状态
  restore(state: ISnapshoot) {
    this.decorate.style = state.style;
    this.decorate.data = state.data;
  }

  // 渲染该组件
  render(onlyDecorate: boolean = false): any {
    throw createError("请为组件添加 render 函数");
  }
}

export default Component;
