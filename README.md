# 📚 Libra - Your Personal Library

A minimalist personal library web app with 2025-style design, built for modern web browsers and optimized for Vercel deployment.

## ✨ Features

- **📖 Book Management**: Add, edit, and organize your personal book collection
- **🎯 Reading Status**: Track books as "To Read", "Ongoing", or "Completed"
- **🔍 Smart Search**: Find books by title, author, or genre
- **📱 Responsive Design**: Beautiful interface that works on all devices
- **🖼️ Image Upload**: Upload book covers or use URL links
- **💾 Local Storage**: Data persists in your browser
- **🎨 Modern UI**: Clean, minimalist design with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/libra-personal-library.git
   cd libra-personal-library
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build CSS**
   ```bash
   npm run build
   ```

4. **Open in browser**
   - Open `public/index.html` in your browser
   - Or use a local server: `npx serve public`

## 🌐 Deploy to Vercel

### Option 1: Deploy via GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect the configuration

3. **Deploy**
   - Click "Deploy"
   - Your app will be live in minutes!

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow the prompts**
   - Link to existing project or create new
   - Choose settings
   - Deploy!

## 🏗️ Project Structure

```
libra-personal-library/
├── public/                 # Static files for deployment
│   ├── index.html         # Main HTML file
│   ├── app.js            # JavaScript application
│   └── styles.css        # Compiled Tailwind CSS
├── src/                   # Source files
│   └── input.css         # Tailwind CSS input
├── vercel.json           # Vercel configuration
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
└── README.md             # This file
```

## 🎨 Customization

### Colors and Themes
- Edit `tailwind.config.js` to customize colors
- Modify `src/input.css` for custom CSS
- Update `public/styles.css` after changes

### Adding Features
- Extend `LibraLibrary` class in `public/app.js`
- Add new UI elements in `public/index.html`
- Style with Tailwind classes

## 🔧 Development

### Build CSS during development
```bash
npm run build:css
```

### Local development
```bash
# Use any static file server
npx serve public
# or
python -m http.server 8000
# or
php -S localhost:8000
```

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🚀 Performance Features

- **Lazy Loading**: Images load as needed
- **Local Storage**: Fast data access
- **Optimized CSS**: Minimal, efficient styles
- **Responsive Images**: Optimized for all screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tailwind CSS** for the utility-first CSS framework
- **Font Awesome** for the beautiful icons
- **Unsplash** for the sample book cover images
- **Vercel** for the amazing deployment platform

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the documentation
- Review the code comments

---

**Happy Reading! 📚✨**
