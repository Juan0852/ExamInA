const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Añadimos 'glb' a las extensiones de assets permitidas
config.resolver.assetExts.push('glb', 'gltf');

module.exports = config;
