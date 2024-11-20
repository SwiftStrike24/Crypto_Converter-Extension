# Crypto Converter Extension

A browser extension that provides real-time cryptocurrency conversion and price tracking functionality. Built with React, TypeScript, and Vite.

## Features

- Real-time cryptocurrency price conversion
- Clean and modern user interface
- Support for multiple cryptocurrencies
- Built with modern web technologies
- Responsive design

## Tech Stack

- React 18
- TypeScript
- Vite
- Styled Components
- Recharts for data visualization
- Axios for API requests
- Date-fns for date manipulation

## Prerequisites

- Node.js (Latest LTS version recommended)
- pnpm package manager

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd crypto-converter-extension
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file based on `.env-example` and add your required API keys.

## Development

To run the extension in development mode:

```bash
pnpm dev
```

## Building the Extension

To build the extension for production:

```bash
pnpm build
```

This will create a `dist` directory with the built extension.

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `dist` directory from this project

## Project Structure

```
crypto-converter-extension/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── styles/            # Styled components and styles
│   ├── App.tsx            # Main App component
│   └── main.tsx           # Entry point
├── dist/                  # Built extension files
└── icons/                # Extension icons
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build the extension
- `pnpm preview` - Preview the build locally

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
