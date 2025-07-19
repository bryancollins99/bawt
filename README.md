# BAWT Writing Tools

A collection of embeddable React writing tools for [Become a Writer Today](https://becomeawritertoday.com), designed to help writers improve their craft and make better publishing decisions.

## 🛠️ Available Tools

### 1. Emotional Tone + Filler Checker
- **Live Word Count**: Real-time word counting with 1000-word limit
- **Filler Word Detection**: Highlights and counts filler words like "just", "really", "very", etc.
- **Emotional Tone Analysis**: Breaks down your writing by emotional keywords (joy, sadness, fear, anger, confidence)
- **Writing Clarity Score**: Calculated based on filler word usage (100 - fillerCount × 2)
- **Smart Suggestions**: Provides actionable feedback to improve your writing

### 2. Palindrome Checker
- **Text Analysis**: Check if your text reads the same forwards and backwards
- **Normalization**: Removes spaces, punctuation, and handles case sensitivity
- **Example Generator**: Generate fun palindrome examples for inspiration
- **Interactive Testing**: Click examples to test them immediately

### 3. Book Royalty Calculator
- **Multiple Models**: Compare KDP 70%, KDP 35%, Traditional Publishing (10%), and custom rates
- **Comparison Mode**: Side-by-side comparison of different royalty models
- **Earnings Projections**: Calculate monthly and annual royalty earnings
- **Smart Suggestions**: Get insights on which model works best for your situation

## 🚀 WordPress Embedding

Each tool can be embedded in WordPress using URL parameters:

```
https://your-domain.com/?embed=true&tool=TOOL_ID
```

**Tool IDs:**
- `emotional-tone` - Emotional Tone + Filler Checker
- `palindrome` - Palindrome Checker  
- `royalty` - Book Royalty Calculator

**Example WordPress shortcode:**
```html
<iframe src="https://your-tools-site.com/?embed=true&tool=emotional-tone" 
        width="100%" height="800" frameborder="0"></iframe>
```

## 🎨 Features

- **Dark Mode**: Toggle between light and dark themes with localStorage persistence
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Brand Integration**: Designed for [Become a Writer Today](https://becomeawritertoday.com) with proper attribution
- **No API Dependencies**: All tools work offline using client-side JavaScript
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## 🏗️ Development

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

```bash
git clone <repository-url>
cd bawt-writing-tools
npm install
```

### Development Server

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Building for Embed Mode

```bash
npm run build:embed
```

## 📦 Deployment

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist/` folder to Netlify
3. Or connect your GitHub repository for automatic deployments

**Netlify Build Settings:**
- Build command: `npm run build`
- Publish directory: `dist`

### WordPress Integration

1. Upload built files to a subdomain (e.g., `tools.becomeawritertoday.com`)
2. Create WordPress shortcodes or use iframe embeds
3. Each tool loads independently with `?embed=true&tool=TOOL_ID`

## 🛠️ Technology Stack

- **React 18** - Frontend framework
- **Vite** - Build tool and dev server  
- **TailwindCSS** - Styling and responsive design
- **React Router** - Client-side routing for multi-tool navigation
- **Vanilla JavaScript** - Text analysis logic (no external APIs)

## 📁 Project Structure

```
src/
├── App.jsx                 # Main application with routing
├── components/
│   ├── Sidebar.jsx        # Navigation sidebar
│   ├── TextInput.jsx      # Text input with highlighting
│   └── Results.jsx        # Analysis results display
├── tools/
│   ├── EmotionalToneChecker.jsx  # Filler word & emotion analysis
│   ├── PalindromeChecker.jsx     # Palindrome detection
│   └── BookRoyaltyCalculator.jsx # Royalty calculations
├── utils/
│   └── textAnalysis.js    # Core analysis logic
├── index.css              # TailwindCSS + custom styles
└── main.jsx               # Application entry point
```

## 🎯 Brand Guidelines

- Primary CTA color: `#d60000` (Become a Writer Today brand red)
- Dark mode support with proper contrast ratios
- Attribution links to https://becomeawritertoday.com
- Professional, clean design suitable for writing professionals

## 📄 License

This project is open source and available under the MIT License.

---

Built with ❤️ for the writing community at [Become a Writer Today](https://becomeawritertoday.com) 