import {
  $applyNodeReplacement,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedTextNode,
  type Spread,
  TextNode,
} from "lexical";

export type SerializedTypeaheadNode = Spread<
  {
    typeaheadType: string;
    content: string;
    trigger: string;
  },
  SerializedTextNode
>;

function $convertTypeaheadElement(
  domNode: HTMLElement,
): DOMConversionOutput | null {
  const textContent = domNode.textContent;
  const typeaheadType = domNode.getAttribute("data-lexical-typeahead-type");
  const content = domNode.getAttribute("data-lexical-typeahead-content");
  const trigger = domNode.getAttribute("data-lexical-typeahead-trigger");

  if (typeaheadType !== null && trigger !== null && textContent) {
    const node = $createTypeaheadNode(
      typeaheadType,
      content ?? textContent,
      trigger,
      textContent,
    );
    return {
      node,
    };
  }

  return null;
}

export class TypeaheadNode extends TextNode {
  __typeaheadType: string;
  __content: string;
  __trigger: string;

  static getType(): string {
    return "typeahead";
  }

  static clone(node: TypeaheadNode): TypeaheadNode {
    return new TypeaheadNode(
      node.__typeaheadType,
      node.__content,
      node.__trigger,
      node.__text,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedTypeaheadNode): TypeaheadNode {
    return $createTypeaheadNode(
      serializedNode.typeaheadType,
      serializedNode.content,
      serializedNode.trigger,
    ).updateFromJSON(serializedNode);
  }

  constructor(
    typeaheadType: string,
    content: string,
    trigger: string,
    text?: string,
    key?: NodeKey,
  ) {
    // Display trigger + content in the editor
    super(text ?? `${trigger}${content}`, key); // CRITICAL: Pass key to parent
    this.__typeaheadType = typeaheadType;
    this.__content = content;
    this.__trigger = trigger;
  }

  exportJSON(): SerializedTypeaheadNode {
    return {
      ...super.exportJSON(),
      typeaheadType: this.__typeaheadType,
      content: this.__content,
      trigger: this.__trigger,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.className = `typeahead typeahead-${this.__typeaheadType}`;
    dom.spellcheck = false;
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.setAttribute("data-lexical-typeahead", "true");
    element.setAttribute("data-lexical-typeahead-type", this.__typeaheadType);
    element.setAttribute("data-lexical-typeahead-trigger", this.__trigger);
    if (
      this.__text !== this.__content &&
      this.__text !== `${this.__trigger}${this.__content}`
    ) {
      element.setAttribute("data-lexical-typeahead-content", this.__content);
    }
    element.textContent = this.__text;
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-typeahead")) {
          return null;
        }
        return {
          conversion: $convertTypeaheadElement,
          priority: 1,
        };
      },
    };
  }

  isTextEntity(): true {
    return true;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }
}

export function $createTypeaheadNode(
  type: string,
  content: string,
  trigger: string,
  text?: string,
): TypeaheadNode {
  const node = new TypeaheadNode(type, content, trigger, text);
  // CRITICAL: Use segmented mode for proper editing
  node.setMode("segmented").toggleDirectionless();
  return $applyNodeReplacement(node);
}

export function $isTypeaheadNode(
  node: LexicalNode | null | undefined,
): node is TypeaheadNode {
  return node instanceof TypeaheadNode;
}
