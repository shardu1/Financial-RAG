import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Database, Bot, Bell, User, Shield, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  
  // RAG Settings
  const [qdrantHost, setQdrantHost] = useState('localhost:6333');
  const [embeddingModel, setEmbeddingModel] = useState('BAAI/bge-large-en-v1.5');
  const [llmModel, setLlmModel] = useState('phi3:mini');
  const [chunkSize, setChunkSize] = useState('1000');
  const [chunkOverlap, setChunkOverlap] = useState('200');
  
  // User Preferences
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [maxResults, setMaxResults] = useState('10');
  
  // Account Settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveRAGSettings = () => {
    toast({
      title: "RAG Settings Saved",
      description: "Your RAG pipeline configuration has been updated successfully",
    });
  };

  const handleSavePreferences = () => {
    toast({
      title: "Preferences Saved",
      description: "Your user preferences have been updated",
    });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password don't match",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully",
    });
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleClearAllData = () => {
    toast({
      title: "Data Cleared",
      description: "All company data and queries have been cleared from the knowledge base",
      variant: "destructive",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export will be ready for download shortly",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold gradient-text">Settings</h2>
        <p className="text-muted-foreground mt-2">
          Configure your RAG pipeline, preferences, and account settings
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* RAG Pipeline Settings */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2 text-primary" />
              RAG Pipeline Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qdrant-host">Qdrant Host</Label>
              <Input
                id="qdrant-host"
                value={qdrantHost}
                onChange={(e) => setQdrantHost(e.target.value)}
                placeholder="localhost:6333"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="embedding-model">Embedding Model</Label>
              <Select value={embeddingModel} onValueChange={setEmbeddingModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAAI/bge-large-en-v1.5">BAAI/bge-large-en-v1.5</SelectItem>
                  <SelectItem value="sentence-transformers/all-MiniLM-L6-v2">all-MiniLM-L6-v2</SelectItem>
                  <SelectItem value="sentence-transformers/all-mpnet-base-v2">all-mpnet-base-v2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="llm-model">LLM Model</Label>
              <Select value={llmModel} onValueChange={setLlmModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phi3:mini">Phi-3 Mini</SelectItem>
                  <SelectItem value="llama2:7b">Llama 2 7B</SelectItem>
                  <SelectItem value="mistral:7b">Mistral 7B</SelectItem>
                  <SelectItem value="codellama:7b">CodeLlama 7B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chunk-size">Chunk Size</Label>
                <Input
                  id="chunk-size"
                  type="number"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chunk-overlap">Chunk Overlap</Label>
                <Input
                  id="chunk-overlap"
                  type="number"
                  value={chunkOverlap}
                  onChange={(e) => setChunkOverlap(e.target.value)}
                />
              </div>
            </div>
            
            <Button onClick={handleSaveRAGSettings} className="w-full bg-gradient-primary">
              Save RAG Settings
            </Button>
          </CardContent>
        </Card>

        {/* User Preferences */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              User Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive processing updates</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-save Queries</Label>
                <p className="text-sm text-muted-foreground">Automatically save query history</p>
              </div>
              <Switch checked={autoSave} onCheckedChange={setAutoSave} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-results">Max Search Results</Label>
              <Select value={maxResults} onValueChange={setMaxResults}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 results</SelectItem>
                  <SelectItem value="10">10 results</SelectItem>
                  <SelectItem value="15">15 results</SelectItem>
                  <SelectItem value="20">20 results</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleSavePreferences} className="w-full bg-gradient-primary">
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Account Settings */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary" />
            Account Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Change Password</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button onClick={handleChangePassword} className="w-full">
                  Change Password
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Data Management</h3>
              <div className="space-y-3">
                <Button onClick={handleExportData} variant="outline" className="w-full">
                  Export All Data
                </Button>
                <Button 
                  onClick={handleClearAllData} 
                  variant="destructive" 
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;