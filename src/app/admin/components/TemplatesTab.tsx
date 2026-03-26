import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Save, X, Plus } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Template, TemplateForm } from '../types';

const supabase = createSupabaseBrowserClient();

interface TemplatesTabProps {
  templates: Template[];
  onDataChange: () => void;
}

export function TemplatesTab({ templates, onDataChange }: TemplatesTabProps) {
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateForm, setTemplateForm] = useState<TemplateForm>({
    category: 'display',
    name: '',
    prompt_template: '',
    description: '',
    industry: 'other'
  });

  const saveTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.prompt_template.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('prompt_templates')
          .update(templateForm)
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast.success('Template updated successfully');
      } else {
        const { error } = await supabase
          .from('prompt_templates')
          .insert({ ...templateForm, is_active: true });

        if (error) throw error;
        toast.success('Template created successfully');
      }

      resetTemplateForm();
      onDataChange();
    } catch (error) {
      toast.error('Error saving template');
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('prompt_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Template deleted successfully');
      onDataChange();
    } catch (error) {
      toast.error('Error deleting template');
    }
  };

  const toggleTemplate = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('prompt_templates')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Template ${!isActive ? 'activated' : 'deactivated'}`);
      onDataChange();
    } catch (error) {
      toast.error('Error updating template');
    }
  };

  const editTemplate = (template: Template) => {
    setEditingTemplate(template);
    setTemplateForm({
      category: template.category,
      name: template.name,
      prompt_template: template.prompt_template,
      description: template.description || '',
      industry: template.industry || 'other'
    });
  };

  const resetTemplateForm = () => {
    setEditingTemplate(null);
    setTemplateForm({
      category: 'display',
      name: '',
      prompt_template: '',
      description: '',
      industry: 'other'
    });
  };

  const handleIndustryChange = (value: string) => {
    // Type guard to ensure value is valid
    const validIndustries = ['f_b', 'beauty', 'fashion', 'mother_baby', 'other'] as const;
    if (validIndustries.includes(value as any)) {
      setTemplateForm({...templateForm, industry: value as TemplateForm['industry']});
    }
  };

  const handleCategoryChange = (value: string) => {
    // Type guard to ensure value is valid
    const validCategories = ['display', 'model', 'social', 'seeding'] as const;
    if (validCategories.includes(value as any)) {
      setTemplateForm({...templateForm, category: value as TemplateForm['category']});
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Template Form */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
            {editingTemplate && (
              <Button variant="ghost" size="sm" onClick={resetTemplateForm}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Industry</label>
            <Select 
              value={templateForm.industry} 
              onValueChange={handleIndustryChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="other">Other (General)</SelectItem>
                <SelectItem value="f_b">Food & Beverage (F&B)</SelectItem>
                <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                <SelectItem value="fashion">Fashion & Accessories</SelectItem>
                <SelectItem value="mother_baby">Mother & Baby</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Select 
              value={templateForm.category} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="display">Display</SelectItem>
                <SelectItem value="model">Model</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="seeding">Seeding</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Template Name</label>
            <Input
              value={templateForm.name}
              onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
              placeholder="VD: Studio Hero"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Prompt Template</label>
            <Textarea
              value={templateForm.prompt_template}
              onChange={(e) => setTemplateForm({...templateForm, prompt_template: e.target.value})}
              placeholder="Create a professional product photo of {product}..."
              rows={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input
              value={templateForm.description}
              onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
              placeholder="Short description of the template"
            />
          </div>

          <Button onClick={saveTemplate} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {editingTemplate ? 'Update' : 'Create'}
          </Button>
        </CardContent>
      </Card>

      {/* Templates List */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Templates List ({templates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold">{template.name}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs mt-1">
                        {template.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {template.industry}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editTemplate(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={template.is_active ? "default" : "secondary"}
                      onClick={() => toggleTemplate(template.id, template.is_active)}
                    >
                      {template.is_active ? 'ON' : 'OFF'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                <p className="text-xs text-gray-500 truncate">{template.prompt_template}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}