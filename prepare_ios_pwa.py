#!/usr/bin/env python3
from pathlib import Path

p = Path("index.html")
html = p.read_text(encoding="utf-8")
if 'id="stage"' not in html or 'id="panel"' not in html:
    raise SystemExit("Base app structure is missing; refusing to publish.")

head_add = """<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="マイメロ壁紙">
<meta name="format-detection" content="telephone=no">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" href="icons/icon-192.png">
<link rel="manifest" href="manifest.webmanifest">"""

if 'rel="manifest"' not in html:
    marker = '<meta name="theme-color" content="#2a2230">'
    if marker not in html:
        raise SystemExit("Theme-color insertion point not found.")
    html = html.replace(marker, marker + "\n" + head_add, 1)

html = html.replace(
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">',
    1
)
html = html.replace(
    '<title>マイメロ壁紙 v23（生活感）</title>',
    '<title>マイメロ壁紙 v35（iPhone版）</title>',
    1
)

css = """<style id="ios-css">
html,body{height:100%;overscroll-behavior:none;-webkit-text-size-adjust:100%}
body{position:fixed;inset:0;width:100%;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
input,textarea{-webkit-user-select:text;user-select:text;font-size:16px}
#wrap{height:100vh;height:100dvh}
</style>"""
if 'id="ios-css"' not in html:
    html = html.replace("</head>", css + "\n</head>", 1)

script_tag = '<script src="ios-pwa-runtime.js"></script>'
if script_tag not in html:
    html = html.replace("</body>", script_tag + "\n</body>", 1)

p.write_text(html, encoding="utf-8")
print("Prepared iPhone PWA v35 index.html")