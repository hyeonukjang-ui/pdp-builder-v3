// engine/block-registry.js
const blockMap = new Map();

export function registerBlock(type, renderer) {
  if (blockMap.has(type)) {
    console.warn(`[block-registry] "${type}" 블록이 이미 등록되어 있습니다. 덮어씁니다.`);
  }
  blockMap.set(type, renderer);
}

export function getBlock(type) {
  return blockMap.get(type) || null;
}

export function getRegisteredBlocks() {
  return [...blockMap.keys()];
}

export function hasBlock(type) {
  return blockMap.has(type);
}
