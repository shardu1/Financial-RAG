import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Trash2, FileText, Globe, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Company {
  id: string;
  name: string;
  documents: number;
  urls: number;
  questions: number;
  lastUpdated: string;
}

const CompanyManagement = () => {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: '1',
      name: 'Apple Inc.',
      documents: 12,
      urls: 25,
      questions: 156,
      lastUpdated: '2 hours ago'
    },
    {
      id: '2',
      name: 'Microsoft Corp.',
      documents: 8,
      urls: 18,
      questions: 89,
      lastUpdated: '4 hours ago'
    },
    {
      id: '3',
      name: 'Google LLC',
      documents: 15,
      urls: 32,
      questions: 234,
      lastUpdated: '6 hours ago'
    },
    {
      id: '4',
      name: 'Tesla Inc.',
      documents: 6,
      urls: 14,
      questions: 67,
      lastUpdated: '1 day ago'
    }
  ]);
  
  const [newCompanyName, setNewCompanyName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddCompany = () => {
    if (!newCompanyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a company name",
        variant: "destructive",
      });
      return;
    }

    const newCompany: Company = {
      id: Date.now().toString(),
      name: newCompanyName.trim(),
      documents: 0,
      urls: 0,
      questions: 0,
      lastUpdated: 'Just now'
    };

    setCompanies([...companies, newCompany]);
    setNewCompanyName('');
    setIsAdding(false);
    
    toast({
      title: "Success",
      description: `${newCompany.name} has been added successfully`,
    });
  };

  const handleRemoveCompany = (companyId: string, companyName: string) => {
    setCompanies(companies.filter(c => c.id !== companyId));
    toast({
      title: "Company Removed",
      description: `${companyName} and all associated data have been removed`,
      variant: "destructive",
    });
  };

  const handleClearKnowledgeBase = (companyName: string) => {
    toast({
      title: "Knowledge Base Cleared",
      description: `All data for ${companyName} has been cleared from the knowledge base`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Company Management</h2>
          <p className="text-muted-foreground mt-2">
            Manage companies in your financial analysis portfolio
          </p>
        </div>
        
        {!isAdding ? (
          <Button onClick={() => setIsAdding(true)} className="bg-gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Company name"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              className="w-48"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCompany()}
            />
            <Button onClick={handleAddCompany} className="bg-gradient-primary">
              Add
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAdding(false);
                setNewCompanyName('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Card key={company.id} className="glass-effect hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Updated {company.lastUpdated}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCompany(company.id, company.name)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-primary/5 rounded-lg">
                  <FileText className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-sm font-medium">{company.documents}</p>
                  <p className="text-xs text-muted-foreground">PDFs</p>
                </div>
                <div className="text-center p-2 bg-success/5 rounded-lg">
                  <Globe className="w-4 h-4 text-success mx-auto mb-1" />
                  <p className="text-sm font-medium">{company.urls}</p>
                  <p className="text-xs text-muted-foreground">URLs</p>
                </div>
                <div className="text-center p-2 bg-warning/5 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-warning mx-auto mb-1" />
                  <p className="text-sm font-medium">{company.questions}</p>
                  <p className="text-xs text-muted-foreground">Q&As</p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleClearKnowledgeBase(company.name)}
                >
                  Clear Data
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 bg-primary hover:bg-primary-dark"
                >
                  Analyze
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {companies.length === 0 && (
        <Card className="glass-effect text-center py-12">
          <CardContent>
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Companies Added</h3>
            <p className="text-muted-foreground mb-6">
              Start by adding companies you want to analyze
            </p>
            <Button onClick={() => setIsAdding(true)} className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Company
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompanyManagement;