import { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import './Categories.css';

const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'
];

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: COLORS[0],
        icon: '📁',
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const response = await categoryService.getAll();
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await categoryService.update(editingCategory.id, formData);
            } else {
                await categoryService.create(formData);
            }
            resetForm();
            loadCategories();
        } catch (error) {
            console.error('Failed to save category:', error);
            alert('Failed to save category');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            color: category.color,
            icon: category.icon,
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure? This will remove the category from all expenses.')) return;

        try {
            await categoryService.delete(id);
            loadCategories();
        } catch (error) {
            console.error('Failed to delete category:', error);
            alert('Failed to delete category');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            color: COLORS[0],
            icon: '📁',
        });
        setEditingCategory(null);
        setShowForm(false);
    };

    return (
        <div className="categories">
            <div className="page-header">
                <div>
                    <h1>Expense Categories</h1>
                    <p className="page-subtitle">Organize your expenses with custom categories</p>
                </div>
                <button
                    className="btn btn-primary btn-lg"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Add Category'}
                </button>
            </div>

            {showForm && (
                <div className="category-form card animate-fade-in">
                    <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g., Food, Transport, Entertainment"
                                />
                            </div>

                            <div className="form-group">
                                <label>Icon</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="📁"
                                    maxLength="2"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="2"
                                placeholder="Optional description..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Color</label>
                            <div className="color-picker">
                                {COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={`color-option ${formData.color === color ? 'selected' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setFormData({ ...formData, color })}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                {editingCategory ? 'Update Category' : 'Add Category'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="categories-grid">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading categories...</p>
                    </div>
                ) : categories.length > 0 ? (
                    categories.map(category => (
                        <div key={category.id} className="category-card card">
                            <div className="category-header">
                                <div className="category-icon" style={{ backgroundColor: category.color + '20', color: category.color }}>
                                    {category.icon}
                                </div>
                                <h3>{category.name}</h3>
                            </div>
                            {category.description && (
                                <p className="category-description">{category.description}</p>
                            )}
                            <div className="category-actions">
                                <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(category)}>
                                    Edit
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(category.id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state card">
                        <p>No categories yet</p>
                        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                            Create Your First Category
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
