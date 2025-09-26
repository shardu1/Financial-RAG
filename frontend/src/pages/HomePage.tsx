import { ArrowRight, FileText, Globe, MessageSquare, BarChart3, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import heroImage from '@/assets/hero-financial-rag.jpg';

const HomePage = () => {
  const features = [
    {
      icon: FileText,
      title: "PDF Document Analysis",
      description: "Upload financial reports and extract insights from text and tables automatically."
    },
    {
      icon: Globe,
      title: "Web Content Scraping",
      description: "Analyze news articles and company websites for comprehensive market intelligence."
    },
    {
      icon: MessageSquare,
      title: "AI-Powered Q&A",
      description: "Ask natural language questions about your financial data and get instant answers."
    },
    {
      icon: BarChart3,
      title: "Data Visualization",
      description: "View extracted financial tables and metrics in clean, structured formats."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your financial data stays secure with enterprise-grade encryption and privacy."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Powered by advanced vector search and local LLM processing for instant results."
    }
  ];

  const handleGetStarted = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">FinanceRAG</span>
          </div>
          <Button onClick={handleGetStarted} className="bg-gradient-primary hover:opacity-90">
            Get Started
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(21, 47, 88, 0.8), rgba(21, 47, 88, 0.9)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-80"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Transform Financial Data Into
              <span className="block text-transparent bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text">
                Actionable Insights
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 animate-slide-up">
              Leverage advanced AI to analyze financial documents, scrape market data, 
              and get instant answers to your most complex financial questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-white text-accent hover:bg-blue-50 text-lg px-8 py-4"
              >
                Start Analyzing
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-4"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 gradient-text">
              Powerful Features for Financial Analysis
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to turn raw financial data into strategic intelligence
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="glass-effect hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Financial Analysis?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of financial professionals using FinanceRAG to make data-driven decisions faster than ever.
          </p>
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="bg-white text-accent hover:bg-blue-50 text-lg px-8 py-4"
          >
            Get Started Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold gradient-text">FinanceRAG</span>
            </div>
            <p className="text-muted-foreground">
              © 2024 FinanceRAG. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;