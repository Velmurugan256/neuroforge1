# NeuroForge

**NeuroForge** is an intelligent document management and analysis platform that leverages AI-powered RAG (Retrieval-Augmented Generation) technology to help organizations efficiently manage, process, and extract insights from their documents.

## 🚀 What NeuroForge Does

### 📁 Smart Document Management
- **File Explorer**: Intuitive file and folder management with realistic inline editing
- **Document Viewer**: Support for multiple file formats (PDF, DOCX, Excel, JSON, Text)
- **Upload & Organization**: Seamless file upload with automatic organization
- **Real-time Updates**: Live synchronization across all operations

### 🤖 AI-Powered Document Intelligence
- **ChatPlayground**: Interactive AI assistant that can answer questions about your documents
- **RAG Integration**: Advanced retrieval system that understands document context
- **Intelligent Insights**: Get answers with confidence scores and source attribution
- **Multi-document Analysis**: Query across multiple documents simultaneously

### 🔄 Advanced Document Processing
- **NeuroSync**: Intelligent document synchronization and processing workflows
- **NeuroWipe**: Secure document cleanup and data sanitization
- **Batch Operations**: Process multiple documents with configurable actions
- **Status Tracking**: Real-time monitoring of document processing states

### 🎯 Key Features
- **Responsive Design**: Modern, mobile-friendly interface
- **Authentication**: Secure user management with protected routes
- **State Management**: Redux-powered state management for seamless UX
- **Real-time Feedback**: Toast notifications and loading states
- **Customizable Workflows**: Flexible document processing pipelines

## 🛠 Technology Stack

- **Frontend**: React 18 + Vite
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS + Shadcn/ui
- **Authentication**: AWS Cognito integration
- **Data Fetching**: SWR for efficient caching
- **Document Processing**: Multi-format viewers and processors
- **AI Integration**: RAG API for intelligent document querying

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd neuroforge1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API endpoints and credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 Environment Configuration

Create a `.env` file with the following variables:

```env
VITE_APP_API_URL=your_api_url_here
VITE_APP_RAG_API_ENDPOINT=https://your-rag-api-endpoint.com/api
VITE_APP_COGNITO_USER_POOL_ID=your_cognito_user_pool_id
VITE_APP_COGNITO_CLIENT_ID=your_cognito_client_id
VITE_APP_COGNITO_REGION=your_aws_region
```

## 🏗 Project Structure

```
src/
├── api/                 # API integration services
├── components/          # Reusable UI components
├── modules/            # Feature-specific components
├── pages/              # Application pages
├── hooks/              # Custom React hooks
├── context/            # React context providers
├── config/             # Configuration files
└── styles/             # Styling utilities
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📄 License

This project is proprietary software developed by Endava.

---

**NeuroForge** - Transforming document management through intelligent AI integration.
