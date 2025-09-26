import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Bot, User, FileText, Globe, Building2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Array<{
    type: 'pdf' | 'url';
    title: string;
    snippet: string;
    source: string;
  }>;
}

interface DataTable {
  title: string;
  headers: string[];
  rows: string[][];
}

const ChatInterface = () => {
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState('');
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [extractedTables, setExtractedTables] = useState<DataTable[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const companies = [
    'Apple Inc.',
    'Microsoft Corp.',
    'Google LLC',
    'Tesla Inc.',
    'Amazon.com Inc.',
    'Meta Platforms Inc.'
  ];

  const sampleQuestions = [
    "What was the revenue for Q4 2023?",
    "Show me the company's debt-to-equity ratio",
    "What are the main risks mentioned in the annual report?",
    "How did the stock price perform last quarter?",
    "What new investments were announced recently?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmitQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCompany) {
      toast({
        title: "Company Required",
        description: "Please select a company to query",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    // Simulate AI response with realistic financial analysis
    setTimeout(() => {
      const mockSources = [
        {
          type: 'pdf' as const,
          title: 'Q4 2023 Financial Report',
          snippet: 'Revenue increased by 12% year-over-year to $119.58 billion, driven by strong iPhone sales and services growth...',
          source: 'Annual Report 2023.pdf'
        },
        {
          type: 'url' as const,
          title: 'Apple Earnings Call Transcript',
          snippet: 'CEO Tim Cook highlighted the strong performance in international markets and the growing services segment...',
          source: 'investor.apple.com'
        }
      ];

      const mockTables: DataTable[] = [
        {
          title: 'Revenue Breakdown by Segment (Q4 2023)',
          headers: ['Segment', 'Revenue (Billions)', 'YoY Growth'],
          rows: [
            ['iPhone', '$69.70', '+2.8%'],
            ['Mac', '$7.78', '-34.1%'],
            ['iPad', '$6.44', '-25.0%'],
            ['Wearables', '$11.95', '+11.2%'],
            ['Services', '$22.31', '+16.3%']
          ]
        }
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Based on ${selectedCompany}'s financial documents, I can provide you with comprehensive insights about their Q4 2023 performance.

**Revenue Performance:**
${selectedCompany} reported strong Q4 2023 results with revenue of $119.58 billion, representing a 12% year-over-year increase. This exceeded analyst expectations and was driven primarily by robust iPhone sales and continued growth in the services segment.

**Key Highlights:**
- iPhone revenue reached $69.70 billion with 2.8% growth
- Services segment showed exceptional growth at 16.3%, generating $22.31 billion
- Wearables, Home and Accessories grew 11.2% to $11.95 billion
- Mac and iPad segments faced headwinds with declines of 34.1% and 25.0% respectively

**Financial Health:**
The company maintains a strong balance sheet with substantial cash reserves and continues to return value to shareholders through dividends and share buybacks.

This analysis is based on official financial reports and earnings call transcripts from the company's investor relations materials.`,
        timestamp: new Date().toLocaleTimeString(),
        sources: mockSources
      };

      setMessages(prev => [...prev, assistantMessage]);
      setExtractedTables(mockTables);
      setIsLoading(false);

      toast({
        title: "Analysis Complete",
        description: "Financial analysis has been generated successfully",
      });
    }, 2000);
  };

  const handleSampleQuestion = (sampleQ: string) => {
    setQuestion(sampleQ);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Response copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold gradient-text">Financial Q&A</h2>
        <p className="text-muted-foreground mt-2">
          Ask questions about your company's financial data and get AI-powered insights
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2 space-y-4">
          {/* Company Selection */}
          <Card className="glass-effect">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-primary" />
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select company to analyze" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 h-96 overflow-y-auto mb-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Start a conversation by asking a question about your financial data</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="space-y-3">
                      <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-4 ${
                          message.type === 'user' 
                            ? 'bg-gradient-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <div className="flex items-start space-x-2">
                            {message.type === 'user' ? (
                              <User className="w-4 h-4 mt-1 flex-shrink-0" />
                            ) : (
                              <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="whitespace-pre-line">{message.content}</p>
                              <p className={`text-xs mt-2 ${
                                message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                {message.timestamp}
                              </p>
                            </div>
                            {message.type === 'assistant' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(message.content)}
                                className="opacity-70 hover:opacity-100"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Sources */}
                      {message.sources && (
                        <div className="ml-6 space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Sources:</p>
                          {message.sources.map((source, idx) => (
                            <Card key={idx} className="border-l-4 border-l-primary">
                              <CardContent className="p-3">
                                <div className="flex items-start space-x-2">
                                  {source.type === 'pdf' ? (
                                    <FileText className="w-4 h-4 mt-1 text-primary" />
                                  ) : (
                                    <Globe className="w-4 h-4 mt-1 text-success" />
                                  )}
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{source.title}</p>
                                    <p className="text-xs text-muted-foreground mb-1">{source.snippet}</p>
                                    <Badge variant="outline" className="text-xs">
                                      {source.source}
                                    </Badge>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask a question about financial data..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSubmitQuestion()}
                  disabled={isLoading || !selectedCompany}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSubmitQuestion}
                  disabled={isLoading || !selectedCompany}
                  className="bg-gradient-primary"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Sample Questions */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg">Sample Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sampleQuestions.map((q, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-3 whitespace-normal"
                  onClick={() => handleSampleQuestion(q)}
                >
                  {q}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Extracted Tables */}
          {extractedTables.length > 0 && (
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg">Financial Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {extractedTables.map((table, idx) => (
                  <div key={idx}>
                    <h4 className="font-medium mb-2">{table.title}</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b">
                            {table.headers.map((header, i) => (
                              <th key={i} className="text-left p-2 font-medium">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows.map((row, i) => (
                            <tr key={i} className="border-b">
                              {row.map((cell, j) => (
                                <td key={j} className="p-2">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;