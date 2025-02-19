# MobielPlus Headless E-commerce

A modern headless e-commerce solution built with Remix and WordPress, designed for MobielPlus's product catalog and shopping experience.

## Features

- 🛍️ Product category browsing
- 🔍 Product search functionality
- 🌐 Multi-language support (NL/BE)
- 📱 Responsive design
- ⚡ Fast loading times
- 🔄 Real-time WordPress integration

## Technology Stack

- [Remix](https://remix.run/) - React-based web framework
- [WordPress](https://wordpress.org/) with GraphQL - Headless CMS
- Custom CSS with CSS Variables
- Modern Icon System

## Development

To run the development server:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

## Build and Deployment

To build for production:

```bash
# Production build
npm run build

# Start production server
npm start
```

## Project Structure

```
app/
├── components/         # Reusable UI components
├── lib/               # Utilities and GraphQL queries
├── routes/            # Application routes
└── styles/            # Global styles and variables
```

## WordPress Integration

The application connects to WordPress via GraphQL API at `mobielplus.com/headless/graphql`. Make sure the WordPress instance has WPGraphQL plugin installed and configured.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential. © MobielPlus.