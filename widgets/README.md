# StreamElements Dog-Themed Custom Widgets

This folder contains the standalone files for the custom widgets, formatted and structured directly for copy-pasting into StreamElements.

## Folder Structure
- `bark-alert/`: **Bark! Alert Box** (Follower/Sub/Cheer/Tip dog bone alert box with collar overlay and Twitch PFP).
  - [widget.html](file:///c:/Users/dinat/Documents/1%20Twitch%20Etsy/Portfolio/widgets/bark-alert/widget.html) -> Paste into the **HTML** tab.
  - [widget.css](file:///c:/Users/dinat/Documents/1%20Twitch%20Etsy/Portfolio/widgets/bark-alert/widget.css) -> Paste into the **CSS** tab.
  - [widget.js](file:///c:/Users/dinat/Documents/1%20Twitch%20Etsy/Portfolio/widgets/bark-alert/widget.js) -> Paste into the **JS** tab.
  - [widget.json](file:///c:/Users/dinat/Documents/1%20Twitch%20Etsy/Portfolio/widgets/bark-alert/widget.json) -> Paste into the **FIELDS** (JSON) tab.

- `pup-chat/`: **Pup Bubble Chat** (Warm tone, bone-white message bubbles with tail-wag badges).
  - [widget.html](file:///c:/Users/dinat/Documents/1%20Twitch%20Etsy/Portfolio/widgets/pup-chat/widget.html) -> Paste into the **HTML** tab.
  - [widget.css](file:///c:/Users/dinat/Documents/1%20Twitch%20Etsy/Portfolio/widgets/pup-chat/widget.css) -> Paste into the **CSS** tab.
  - [widget.js](file:///c:/Users/dinat/Documents/1%20Twitch%20Etsy/Portfolio/widgets/pup-chat/widget.js) -> Paste into the **JS** tab.
  - [widget.json](file:///c:/Users/dinat/Documents/1%20Twitch%20Etsy/Portfolio/widgets/pup-chat/widget.json) -> Paste into the **FIELDS** (JSON) tab.

- `pup-goal/`: **Fetch the Bone Goal** (Interactive linear milestones bar with progress dog runner and celebrating target bone).
  - [widget.html](file:///c:/Users/dinat/Documents/1%20Twitch%20Etsy/Portfolio/widgets/pup-goal/widget.html) -> Paste into the **HTML** tab.
  - [widget.css](file:///c:/Users/dinat/Documents/1%20Twitch%20Etsy/Portfolio/widgets/pup-goal/widget.css) -> Paste into the **CSS** tab.
  - [widget.js](file:///c:/Users/dinat/Documents/1%20Twitch%20Etsy/Portfolio/widgets/pup-goal/widget.js) -> Paste into the **JS** tab.
  - [widget.json](file:///c:/Users/dinat/Documents/1%20Twitch%20Etsy/Portfolio/widgets/pup-goal/widget.json) -> Paste into the **FIELDS** (JSON) tab.

---

## How to Install in StreamElements
1. Go to your **StreamElements Dashboard** and navigate to **Streaming Tools** -> **Overlays**.
2. Click **Create New Overlay** (or edit an existing one).
3. Click the **+** (Add Widget) icon in the bottom-left, select **Static/Custom** -> **Custom Widget**.
4. Click on the new widget, open the **Settings** menu on the left side, and click **Open Editor**.
5. Copy the contents of the four files (`widget.html`, `widget.css`, `widget.js`, `widget.json`) from the respective widget directory and paste them into their tabs in the StreamElements code editor.
6. Click **Done** and then **Save** the overlay!

---

## How to push only the `widgets/` folder to GitHub

Since the global command line environment on your current system doesn't have the `git` path configured, you can easily connect and push just this folder to GitHub using one of the following methods:

### Option A: Using GitHub Desktop (Easiest, Recommended)
1. Download and install [GitHub Desktop](https://desktop.github.com/).
2. Open GitHub Desktop and click **File** -> **New Repository** (or **Add Local Repository** if you want to initialize it).
3. Set the repository path directly to `c:\Users\dinat\Documents\1 Twitch Etsy\Portfolio\widgets` (so only the `widgets` folder is tracked).
4. Click **Create Repository**.
5. Once created, click **Publish Repository** to upload it directly to your GitHub account!

### Option B: Using Git Bash (Command Line)
If you have Git installed, it comes with a shell called **Git Bash** which has its own terminal paths configured:
1. Right-click on the `widgets` folder in Windows File Explorer and select **Git Bash Here**.
2. Run the following commands to initialize and push:
   ```bash
   git init
   git add .
   git commit -m "Initialize StreamElements dog alert box widget package"
   git branch -M main
   # Add your GitHub repository link:
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```
