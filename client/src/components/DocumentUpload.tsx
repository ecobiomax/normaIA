import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, Loader2, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function DocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadDocument = trpc.documents.uploadPDF.useMutation();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    if (!file.type.includes('pdf')) {
      toast.error('Por favor, selecione apenas arquivos PDF.');
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        
        try {
          const result = await uploadDocument.mutateAsync({
            filename: file.name,
            fileData: base64Data.split(',')[1], // Remove data:application/pdf;base64, prefix
          });

          if (result.success) {
            toast.success(`Documento "${file.name}" processado com sucesso!`);
            setUploadedFiles(prev => [...prev, file.name]);
          } else {
            toast.error(result.message || 'Erro ao processar documento.');
          }
        } catch (error) {
          console.error('Upload error:', error);
          toast.error('Erro ao fazer upload do documento.');
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File reading error:', error);
      toast.error('Erro ao ler o arquivo.');
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Upload de Normas Técnicas
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Faça upload de documentos PDF com normas técnicas (NBR, ASME, Petrobras, etc.)
            </p>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-3 text-slate-400" />
            <p className="text-sm text-slate-600 mb-4">
              Arraste um arquivo PDF aqui ou clique para selecionar
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            
            <Button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Arquivo
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Documentos Processados
          </h3>
          <div className="space-y-2">
            {uploadedFiles.map((filename, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800">{filename}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4 bg-blue-50">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Dicas de Upload:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Formato aceito: PDF</li>
          <li>• Tamanho máximo: 50MB</li>
          <li>• Documentos serão automaticamente divididos em seções</li>
          <li>• O processamento pode levar alguns segundos dependendo do tamanho</li>
        </ul>
      </Card>
    </div>
  );
}
