import React, { useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

interface MathTextProps {
  text: string;
  fontSize?: number;
  color?: string;
}

export function MathText({ text, fontSize = 16, color = '#0f172a' }: MathTextProps) {
  const [webViewHeight, setWebViewHeight] = useState(50);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" />
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"
          onload="renderMathInElement(document.body, {
            delimiters: [
              {left: '$$', right: '$$', display: true},
              {left: '$', right: '$', display: false},
              {left: '\\\\(', right: '\\\\)', display: false},
              {left: '\\\\[', right: '\\\\]', display: true}
            ]
          });
          const updateHeight = () => {
            const height = document.documentElement.scrollHeight;
            window.ReactNativeWebView.postMessage(height.toString());
          };
          updateHeight();
          setTimeout(updateHeight, 500); // Para asegurar que KaTeX terminó de renderizar
        "></script>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: ${fontSize}px;
            color: ${color};
            margin: 0;
            padding: 0;
            background-color: transparent;
            line-height: 1.5;
            word-wrap: break-word;
          }
        </style>
      </head>
      <body>
        ${text.replace(/\n/g, '<br/>')}
      </body>
    </html>
  `;

  return (
    <View style={{ height: webViewHeight, width: '100%', backgroundColor: 'transparent' }}>
      <WebView
        source={{ html: htmlContent }}
        style={{ backgroundColor: 'transparent', flex: 1 }}
        onMessage={(event) => {
          const height = parseInt(event.nativeEvent.data, 10);
          if (height && height !== webViewHeight) {
            setWebViewHeight(height);
          }
        }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        originWhitelist={['*']}
      />
    </View>
  );
}
