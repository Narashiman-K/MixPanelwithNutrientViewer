# Nutrient PDF Viewer with Mixpanel event tracker Example (Vite + React)

This project demonstrates how to integrate the [Nutrient (PSPDFKit) Web SDK](https://www.nutrient.io/sdk/web/) with MixPanel to include advanced event tracking with [Mixpanel](https://mixpanel.com/) and a built-in debug panel for real-time analytics.

---

## Features

- 📄 **View and Annotate PDFs** using the Nutrient (PSPDFKit) Web SDK.
- 📝 **Track User Interactions** (annotations, navigation, zoom, search, etc.) with Mixpanel.
- 🛠️ **Debug Panel** for live inspection of SDK events and analytics.
- ⚡ **Fast Development** with Vite and React 18.
- 🔒 **Environment-based configuration** for API keys and tokens.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer recommended)
- A valid Nutrient (PSPDFKit) Web SDK license key
- A Mixpanel project token

---

## Getting Started

### 1. Clone the Repository

```sh
git clone <your-repo-url>
cd trialTryOuts/nutrient-vite-cdn-MixpanelRecordingwebviewer
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root (already present in this repo):

```properties
VITE_MIXPANEL_TOKEN=your-mixpanel-token
VITE_lkey=your-nutrient-license-key
```

Replace the values with your actual Mixpanel token and Nutrient SDK license key.

---

## Running the App

### Development Mode

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

![chrome_sZfkFFsokb](https://github.com/user-attachments/assets/c0c03ee2-a4a4-48ba-aa52-517912a3bd9c)


### Production Build

```sh
npm run build
npm run preview
```

Preview your build at [http://localhost:4173](http://localhost:4173).

---

## Usage

- **Upload a PDF**: Click "Choose PDF Document" to load your own PDF.
- **Interact**: Navigate pages, zoom, annotate, search, fill forms, etc.
- **Debug Panel**: Click the "🔧 SDK Events" toggle (bottom right in dev mode) to view real-time event analytics and statistics.

---

## Project Structure

```
src/
  app.jsx                # Main React app
  components/
    pdf-viewer-component.jsx  # Nutrient SDK integration & event tracking
    debug-panel.jsx           # Live Mixpanel/SDK event debug panel
  services/
    mixpanel.js               # Mixpanel analytics integration
public/
  document.pdf           # Default sample PDF
.env                     # Environment variables (license keys, tokens)
```

---

## Analytics & Debugging

- All major SDK events (page navigation, annotation, search, etc.) are tracked via [`mixpanelService`](src/services/mixpanel.js).
- The [`DebugPanel`](src/components/debug-panel.jsx) shows live event stats and recent events for development and troubleshooting.
- You can trigger test events and clear the event log from the debug panel.

---

## Customization

- **Toolbar**: Modify the `toolbarItems` array in [`pdf-viewer-component.jsx`](src/components/pdf-viewer-component.jsx) to customize available tools.
- **Mixpanel Events**: Extend or adjust event tracking in [`setupNutrientSDKEvents`](src/components/pdf-viewer-component.jsx) and [`mixpanelService`](src/services/mixpanel.js).
- **Styling**: Edit `app.css` or add your own styles for UI customization.

---

## Troubleshooting

- **Nutrient SDK not loading?**  
  Ensure your license key is valid and available in `.env` as `VITE_lkey`.
- **Mixpanel not tracking?**  
  Check your Mixpanel token in `.env` and browser console for debug logs.
- **PDF not displaying?**  
  Confirm the PDF file is valid and CORS is not blocking access.

---

## License

This project is for demonstration and evaluation purposes.  
See [Nutrient SDK License](https://www.nutrient.io/legal/Nutrient_SDK_User_Evaluation_Subscription_Agreement) for SDK usage terms.

---

## Support

- [Nutrient (PSPDFKit) Support](https://www.nutrient.io/support/request/)
- [Mixpanel Documentation](https://developer.mixpanel.com/docs/javascript)
- For issues with this example, open an issue in your repository.

---

## Credits

- [Nutrient (PSPDFKit)](https://www.nutrient.io/)
- [Mixpanel](https://mixpanel.com/)
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Author](https://www.linkedin.com/in/narashimank/)

---

Enjoy exploring PDF analytics with Nutrient
