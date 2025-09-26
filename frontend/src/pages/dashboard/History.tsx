import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { History as HistoryIcon, MessageSquare, Calendar, Search, Filter, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HistoryItem {
  id: string;
  question: string;
  answer: string;
  company: string;
  timestamp: string;
  sources: number;
  category: 'revenue' | 'expenses' | 'risks' | 'performance' | 'general';
}

const History = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const historyItems: HistoryItem[] = [
    {
      id: '1',
      question: 'What was the revenue for Q4 2023?',
      answer: 'Apple reported Q4 2023 revenue of $119.58 billion, representing a 12% year-over-year increase...',
      company: 'Apple Inc.',
      timestamp: '2024-01-25 14:30',
      sources: 3,
      category: 'revenue'
    },
    {
      id: '2',
      question: 'What are the main operational risks?',
      answer: 'The company identified several key operational risks including supply chain disruptions...',
      company: 'Tesla Inc.',
      timestamp: '2024-01-25 13:15',
      sources: 2,
      category: 'risks'
    },
    {
      id: '3',
      question: 'How did cloud services perform in the last quarter?',
      answer: 'Microsoft Azure revenue grew 30% year-over-year, continuing strong double-digit growth...',
      company: 'Microsoft Corp.',
      timestamp: '2024-01-25 11:45',
      sources: 4,
      category: 'performance'
    },
    {
      id: '4',
      question: 'What were the R&D expenses in 2023?',
      answer: 'Google invested $39.5 billion in research and development during 2023, focusing on AI...',
      company: 'Google LLC',
      timestamp: '2024-01-24 16:20',
      sources: 2,
      category: 'expenses'
    },
    {
      id: '5',
      question: 'Show me the debt-to-equity ratio trend',
      answer: 'The debt-to-equity ratio has improved from 0.31 to 0.28 over the past year...',
      company: 'Apple Inc.',
      timestamp: '2024-01-24 14:10',
      sources: 1,
      category: 'performance'
    }
  ];

  const companies = ['Apple Inc.', 'Microsoft Corp.', 'Google LLC', 'Tesla Inc.'];
  const categories = [
    { value: 'revenue', label: 'Revenue' },
    { value: 'expenses', label: 'Expenses' },
    { value: 'risks', label: 'Risks' },
    { value: 'performance', label: 'Performance' },
    { value: 'general', label: 'General' }
  ];

  const filteredItems = historyItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = !filterCompany || item.company === filterCompany;
    const matchesCategory = !filterCategory || item.category === filterCategory;
    
    return matchesSearch && matchesCompany && matchesCategory;
  });

  const handleDeleteItem = (id: string, question: string) => {
    toast({
      title: "Query Deleted",
      description: `"${question.substring(0, 50)}..." has been removed from history`,
      variant: "destructive",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      revenue: 'bg-success/10 text-success',
      expenses: 'bg-warning/10 text-warning',
      risks: 'bg-destructive/10 text-destructive',
      performance: 'bg-primary/10 text-primary',
      general: 'bg-muted text-muted-foreground'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold gradient-text">Query History</h2>
        <p className="text-muted-foreground mt-2">
          View and manage your previous financial analysis queries
        </p>
      </div>

      {/* Filters */}
      <Card className="glass-effect">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions and answers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterCompany('');
                setFilterCategory('');
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredItems.length} of {historyItems.length} queries
        </p>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <Card className="glass-effect text-center py-12">
            <CardContent>
              <HistoryIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterCompany || filterCategory 
                  ? "Try adjusting your filters or search terms"
                  : "Start asking questions to build your query history"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="glass-effect hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-2">{item.question}</h3>
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge variant="outline">{item.company}</Badge>
                        <Badge className={getCategoryColor(item.category)}>
                          {categories.find(c => c.value === item.category)?.label}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatTimestamp(item.timestamp)}
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-3 line-clamp-3">
                        {item.answer}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Based on {item.sources} source{item.sources !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id, item.question)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default History;