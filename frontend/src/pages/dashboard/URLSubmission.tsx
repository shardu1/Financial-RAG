import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, Plus, Check, AlertCircle, Building2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScrapedURL {
  id: string;
  url: string;
  title: string;
  status: 'scraping' | 'completed' | 'error';
  company: string;
  wordCount?: number;
  timestamp: string;
  source: string;
}

const URLSubmission = () => {
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [scrapedUrls, setScrapedUrls] = useState<ScrapedURL[]>([
    {
      id: '1',
      url: 'https://investor.apple.com/news/press-releases/2024/01/25/Apple-reports-first-quarter-results',
      title: 'Apple Reports Q1 2024 Results',
      status: 'completed',
      company: 'Apple Inc.',
      wordCount: 1250,
      timestamp: '2 hours ago',
      source: 'investor.apple.com'
    },
    {
      id: '2',
      url: 'https://techcrunch.com/2024/01/24/microsoft-ai-investment',
      title: 'Microsoft Announces Major AI Investment',
      status: 'completed',
      company: 'Microsoft Corp.',
      wordCount: 890,
      timestamp: '4 hours ago',
      source: 'techcrunch.com'
    }
  ]);

  const companies = [
    'Apple Inc.',
    'Microsoft Corp.',
    'Google LLC',
    'Tesla Inc.',
    'Amazon.com Inc.',
    'Meta Platforms Inc.'
  ];

  const predefinedUrls = [
    { label: 'SEC Edgar Database', url: 'https://www.sec.gov/edgar' },
    { label: 'Yahoo Finance', url: 'https://finance.yahoo.com' },
    { label: 'MarketWatch News', url: 'https://www.marketwatch.com' },
    { label: 'Reuters Business', url: 'https://www.reuters.com/business' },
    { label: 'Bloomberg Markets', url: 'https://www.bloomberg.com/markets' },
    { label: 'CNBC Markets', url: 'https://www.cnbc.com/markets' }
  ];

  const handleSubmitURL = () => {
    if (!urlInput.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCompany) {
      toast({
        title: "Company Required",
        description: "Please select a company to associate with this URL",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      const url = new URL(urlInput);
      if (!url.protocol.startsWith('http')) {
        throw new Error('Invalid protocol');
      }
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid HTTP or HTTPS URL",
        variant: "destructive",
      });
      return;
    }

    const newUrl: ScrapedURL = {
      id: Date.now().toString(),
      url: urlInput,
      title: 'Scraping content...',
      status: 'scraping',
      company: selectedCompany,
      timestamp: 'Just now',
      source: new URL(urlInput).hostname
    };

    setScrapedUrls(prev => [newUrl, ...prev]);
    setUrlInput('');

    // Simulate scraping process
    setTimeout(() => {
      setScrapedUrls(prev => prev.map(url => 
        url.id === newUrl.id 
          ? {
              ...url,
              status: 'completed',
              title: `${selectedCompany} - Web Content Analysis`,
              wordCount: Math.floor(Math.random() * 2000) + 500
            }
          : url
      ));

      toast({
        title: "URL Processed Successfully",
        description: `Content from ${new URL(urlInput).hostname} has been added to ${selectedCompany}'s knowledge base`,
      });
    }, 2000);
  };

  const handlePredefinedUrl = (url: string) => {
    setUrlInput(url);
  };

  const getStatusIcon = (status: ScrapedURL['status']) => {
    switch (status) {
      case 'scraping':
        return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <Check className="w-4 h-4 text-success" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: ScrapedURL['status']) => {
    const variants = {
      scraping: { variant: 'secondary' as const, text: 'Scraping' },
      completed: { variant: 'default' as const, text: 'Completed' },
      error: { variant: 'destructive' as const, text: 'Error' }
    };
    const { variant, text } = variants[status];
    return <Badge variant={variant}>{text}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold gradient-text">URL Content Scraping</h2>
        <p className="text-muted-foreground mt-2">
          Add web pages, news articles, and financial content to your knowledge base
        </p>
      </div>

      {/* Company Selection */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-primary" />
            Select Company
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a company to associate with scraped content" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company} value={company}>
                  {company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* URL Input */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2 text-primary" />
            Add URL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter URL to scrape (e.g., https://example.com/article)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitURL()}
            />
            <Button 
              onClick={handleSubmitURL}
              disabled={!selectedCompany}
              className="bg-gradient-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add URL
            </Button>
          </div>

          {/* Quick Access URLs */}
          <div>
            <p className="text-sm font-medium mb-3">Quick Access - Financial Sources:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {predefinedUrls.map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePredefinedUrl(item.url)}
                  className="justify-start text-left"
                >
                  <ExternalLink className="w-3 h-3 mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scraped URLs History */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Recent URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scrapedUrls.map((item) => (
              <div key={item.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getStatusIcon(item.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium truncate">{item.title}</h3>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-1">
                        {item.url}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{item.company}</span>
                        <span>{item.source}</span>
                        <span>{item.timestamp}</span>
                        {item.wordCount && <span>{item.wordCount} words</span>}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(item.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default URLSubmission;