import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { FileText, Upload, Check, AlertCircle, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  company: string;
  pages?: number;
  tables?: number;
}

const PDFUpload = () => {
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const companies = [
    'Apple Inc.',
    'Microsoft Corp.',
    'Google LLC',
    'Tesla Inc.',
    'Amazon.com Inc.',
    'Meta Platforms Inc.'
  ];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const processFile = (file: File, company: string) => {
    const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      status: 'uploading',
      progress: 0,
      company: company
    };

    setFiles(prev => [...prev, newFile]);

    // Simulate upload and processing
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      
      if (progress < 30) {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress: progress, status: 'uploading' } : f
        ));
      } else if (progress < 80) {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress: progress, status: 'processing' } : f
        ));
      } else {
        clearInterval(interval);
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { 
            ...f, 
            progress: 100, 
            status: 'completed',
            pages: Math.floor(Math.random() * 50) + 10,
            tables: Math.floor(Math.random() * 8) + 2
          } : f
        ));
        
        toast({
          title: "PDF Processed Successfully",
          description: `${file.name} has been added to ${company}'s knowledge base`,
        });
      }
    }, 500);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (!selectedCompany) {
      toast({
        title: "Company Required",
        description: "Please select a company before uploading files",
        variant: "destructive",
      });
      return;
    }

    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFiles = droppedFiles.filter(file => file.type === 'application/pdf');

    if (pdfFiles.length === 0) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF files only",
        variant: "destructive",
      });
      return;
    }

    pdfFiles.forEach(file => processFile(file, selectedCompany));
  }, [selectedCompany, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCompany) {
      toast({
        title: "Company Required",
        description: "Please select a company before uploading files",
        variant: "destructive",
      });
      return;
    }

    const selectedFiles = Array.from(e.target.files || []);
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');

    if (pdfFiles.length === 0) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF files only",
        variant: "destructive",
      });
      return;
    }

    pdfFiles.forEach(file => processFile(file, selectedCompany));
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <Check className="w-4 h-4 text-success" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing PDF...';
      case 'completed':
        return 'Processed';
      case 'error':
        return 'Error';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold gradient-text">Upload PDF Documents</h2>
        <p className="text-muted-foreground mt-2">
          Upload financial reports, earnings statements, and other PDF documents for analysis
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
              <SelectValue placeholder="Choose a company to associate with uploaded documents" />
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

      {/* Upload Area */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2 text-primary" />
            Upload Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
            } ${!selectedCompany ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Drag and drop PDF files here
            </h3>
            <p className="text-muted-foreground mb-4">
              or click to browse your files
            </p>
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={!selectedCompany}
            />
            <Button
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={!selectedCompany}
              className="bg-gradient-primary"
            >
              <Upload className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Processing Status */}
      {files.length > 0 && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Processing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(file.status)}
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {file.size} • {file.company}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{getStatusText(file.status)}</p>
                      {file.status === 'completed' && (
                        <p className="text-xs text-muted-foreground">
                          {file.pages} pages • {file.tables} tables extracted
                        </p>
                      )}
                    </div>
                  </div>
                  <Progress value={file.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PDFUpload;