import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Plus, Edit, Trash2, Package, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SafeImage } from '../components/SafeImage';

export const AdminTenders = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTender, setEditingTender] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    weight: '',
    deadline: '',
    image_url: '',
    category: '',
    status: 'active',
  });

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      const response = await api.get('/tenders', { params: { status: undefined, limit: 200 } });
      const tenderData = Array.isArray(response.data) ? response.data : [];
      setTenders(tenderData);
    } catch (error) {
      toast.error('Failed to load tenders');
      setTenders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    setUploading(true);
    try {
      const response = await api.post('/upload-image', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const imageUrl = response.data.image_url;
      setFormData({ ...formData, image_url: imageUrl });
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload image');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleOpenDialog = (tender = null) => {
    if (tender) {
      setEditingTender(tender);
      setFormData({
        title: tender.title,
        description: tender.description,
        price: tender.price.toString(),
        weight: tender.weight || '',
        deadline: tender.deadline || '',
        image_url: tender.image_url || '',
        category: tender.category || '',
        status: tender.status,
      });
    } else {
      setEditingTender(null);
      setFormData({
        title: '',
        description: '',
        price: '',
        weight: '',
        deadline: '',
        image_url: '',
        category: '',
        status: 'active',
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      weight: formData.weight || null,
      deadline: formData.deadline || null,
      image_url: formData.image_url || null,
      category: formData.category || null,
      status: formData.status,
    };

    console.log(`[AdminTenders] Submitting tender with payload:`, payload);

    try {
      if (editingTender) {
        await api.put(`/tenders/${editingTender.tender_id}`, payload);
        toast.success('Tender updated successfully');
      } else {
        await api.post('/tenders', payload);
        toast.success('Tender created successfully');
      }
      setDialogOpen(false);
      fetchTenders();
    } catch (error) {
      console.error(`[AdminTenders] Submit error:`, error);
      toast.error(error.response?.data?.detail || 'Failed to save tender');
    }
  };

  const handleDelete = async (tenderId) => {
    if (!window.confirm('Are you sure you want to delete this tender?')) {
      return;
    }

    try {
      await api.delete(`/tenders/${tenderId}`);
      toast.success('Tender deleted successfully');
      fetchTenders();
    } catch (error) {
      toast.error('Failed to delete tender');
    }
  };

  return (
    <div className="min-h-screen bg-background py-8" data-testid="admin-tenders-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-manrope font-bold text-4xl text-foreground mb-2" data-testid="admin-tenders-title">
              Tender Management
            </h1>
            <p className="text-muted-foreground text-lg">
              Create, edit, and manage tenders
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                data-testid="add-tender-btn"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Tender
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-manrope text-2xl">
                  {editingTender ? 'Edit Tender' : 'Create New Tender'}
                </DialogTitle>
                <DialogDescription>
                  {editingTender ? 'Update tender information' : 'Fill in the details to create a new tender'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="tender-form">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    data-testid="tender-title-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    required
                    data-testid="tender-description-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      data-testid="tender-price-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="e.g., 2.5kg"
                      data-testid="tender-weight-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Tools, Equipment"
                      data-testid="tender-category-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      placeholder="e.g., 31 Dec 2025"
                      data-testid="tender-deadline-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tender Image</Label>
                  <div className="flex flex-col gap-4">
                    {/* Image Preview */}
                    {formData.image_url && (
                      <div className="relative w-full h-48 group">
                        <SafeImage
                          src={formData.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg border border-border"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => setFormData({ ...formData, image_url: '' })}
                          >
                            Remove Image
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Upload Options */}
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Upload Image</label>
                        <label className="relative border-2 border-dashed border-border rounded-lg p-4 hover:border-accent transition-colors cursor-pointer flex items-center justify-center">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                          <div className="text-center">
                            {uploading ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                                <span className="text-sm text-muted-foreground">Uploading...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <Upload className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">Click to upload</span>
                                <span className="text-xs text-muted-foreground">or drag and drop</span>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger data-testid="tender-status-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" data-testid="tender-submit-btn">
                  {editingTender ? 'Update Tender' : 'Create Tender'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12" data-testid="tenders-loading">
            <p className="text-muted-foreground">Loading tenders...</p>
          </div>
        ) : tenders.length === 0 ? (
          <Card className="border-border shadow-sm" data-testid="tenders-empty">
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-manrope font-semibold text-xl mb-2">No tenders yet</h3>
              <p className="text-muted-foreground">Create your first tender to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4" data-testid="tenders-list">
            {tenders.map((tender) => (
              <Card key={tender.tender_id} className="border-border shadow-sm hover:border-slate-300 transition-colors" data-testid={`tender-item-${tender.tender_id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <SafeImage
                      src={tender.image_url}
                      alt={tender.title}
                      className="w-24 h-24 object-cover rounded-lg border border-border"
                      fallbackSize={8}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-manrope font-semibold text-xl text-foreground mb-1">{tender.title}</h3>
                          {tender.category && (
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded">
                              {tender.category}
                            </span>
                          )}
                        </div>
                        <Badge variant={tender.status === 'active' ? 'default' : 'outline'} data-testid={`tender-status-${tender.tender_id}`}>
                          {tender.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{tender.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-6">
                          <div>
                            <p className="text-xs text-muted-foreground">Price</p>
                            <p className="font-manrope font-semibold text-lg text-primary">₹{(tender.price || 0).toLocaleString()}</p>
                          </div>
                          {tender.weight && (
                            <div>
                              <p className="text-xs text-muted-foreground">Weight</p>
                              <p className="font-medium text-sm">{tender.weight}</p>
                            </div>
                          )}
                          {tender.deadline && (
                            <div>
                              <p className="text-xs text-muted-foreground">Deadline</p>
                              <p className="font-medium text-sm">{new Date(tender.deadline).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(tender)}
                            data-testid={`edit-tender-${tender.tender_id}`}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(tender.tender_id)}
                            data-testid={`delete-tender-${tender.tender_id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
