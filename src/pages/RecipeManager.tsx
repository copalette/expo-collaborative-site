import React, { useState, useEffect } from 'react';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

interface Step {
  id: string;
  order: number;
  instruction: string;
  time?: number; // 分
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cookTime: number; // 分
  servings: number;
  ingredients: Ingredient[];
  steps: Step[];
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  rating?: number;
  imageUrl?: string;
}

const RecipeManager: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'cookTime' | 'rating'>('createdAt');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [formData, setFormData] = useState<Partial<Recipe>>({
    title: '',
    description: '',
    category: '',
    difficulty: 'easy',
    cookTime: 30,
    servings: 4,
    ingredients: [],
    steps: [],
    tags: [],
    notes: '',
    rating: 5,
  });

  const [newIngredient, setNewIngredient] = useState({ name: '', amount: '', unit: '' });
  const [newStep, setNewStep] = useState({ instruction: '', time: 0 });
  const [newTag, setNewTag] = useState('');

  const categories = [
    '主菜', '副菜', 'スープ', 'サラダ', 'デザート', 'ご飯もの', '麺類', 
    'パン', '鍋料理', '和食', '洋食', '中華', 'エスニック', 'おつまみ'
  ];

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = () => {
    const saved = localStorage.getItem('recipes');
    if (saved) {
      setRecipes(JSON.parse(saved));
    }
  };

  const saveRecipes = (newRecipes: Recipe[]) => {
    localStorage.setItem('recipes', JSON.stringify(newRecipes));
    setRecipes(newRecipes);
  };

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.amount) {
      const ingredient: Ingredient = {
        id: Date.now().toString(),
        name: newIngredient.name,
        amount: newIngredient.amount,
        unit: newIngredient.unit,
      };
      setFormData({
        ...formData,
        ingredients: [...(formData.ingredients || []), ingredient],
      });
      setNewIngredient({ name: '', amount: '', unit: '' });
    }
  };

  const removeIngredient = (id: string) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients?.filter(ing => ing.id !== id),
    });
  };

  const addStep = () => {
    if (newStep.instruction) {
      const step: Step = {
        id: Date.now().toString(),
        order: (formData.steps?.length || 0) + 1,
        instruction: newStep.instruction,
        time: newStep.time || undefined,
      };
      setFormData({
        ...formData,
        steps: [...(formData.steps || []), step],
      });
      setNewStep({ instruction: '', time: 0 });
    }
  };

  const removeStep = (id: string) => {
    const updatedSteps = formData.steps?.filter(step => step.id !== id)
      .map((step, index) => ({ ...step, order: index + 1 }));
    setFormData({
      ...formData,
      steps: updatedSteps,
    });
  };

  const addTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag],
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag),
    });
  };

  const saveRecipe = () => {
    if (!formData.title || !formData.ingredients?.length || !formData.steps?.length) {
      alert('タイトル、材料、手順は必須です');
      return;
    }

    const now = new Date().toISOString();
    const recipe: Recipe = {
      id: editingRecipe?.id || Date.now().toString(),
      title: formData.title!,
      description: formData.description || '',
      category: formData.category || 'その他',
      difficulty: formData.difficulty!,
      cookTime: formData.cookTime!,
      servings: formData.servings!,
      ingredients: formData.ingredients!,
      steps: formData.steps!,
      tags: formData.tags || [],
      notes: formData.notes || '',
      createdAt: editingRecipe?.createdAt || now,
      updatedAt: now,
      rating: formData.rating,
    };

    const updatedRecipes = editingRecipe
      ? recipes.map(r => r.id === editingRecipe.id ? recipe : r)
      : [...recipes, recipe];

    saveRecipes(updatedRecipes);
    resetForm();
  };

  const deleteRecipe = (id: string) => {
    if (window.confirm('このレシピを削除しますか？')) {
      const updatedRecipes = recipes.filter(r => r.id !== id);
      saveRecipes(updatedRecipes);
    }
  };

  const editRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormData(recipe);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      difficulty: 'easy',
      cookTime: 30,
      servings: 4,
      ingredients: [],
      steps: [],
      tags: [],
      notes: '',
      rating: 5,
    });
    setEditingRecipe(null);
    setShowForm(false);
  };

  const filteredAndSortedRecipes = recipes
    .filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || recipe.category === filterCategory;
      const matchesDifficulty = filterDifficulty === 'all' || recipe.difficulty === filterDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'cookTime':
          return a.cookTime - b.cookTime;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const getDifficultyIcon = (difficulty: Recipe['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
    }
  };

  const getDifficultyText = (difficulty: Recipe['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '簡単';
      case 'medium': return '普通';
      case 'hard': return '難しい';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            📝 レシピ管理帳
          </h1>
          <p className="text-xl text-gray-600">
            お気に入りのレシピを整理して保存
          </p>
        </header>

        {!showForm ? (
          <>
            {/* コントロールパネル */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold"
                >
                  ➕ 新しいレシピ
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded ${
                      viewMode === 'grid' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    🎞️ グリッド
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded ${
                      viewMode === 'list' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    📋 リスト
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="レシピを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="p-2 border rounded-md"
                />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="p-2 border rounded-md"
                >
                  <option value="all">すべてのカテゴリ</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="p-2 border rounded-md"
                >
                  <option value="all">すべての難易度</option>
                  <option value="easy">🟢 簡単</option>
                  <option value="medium">🟡 普通</option>
                  <option value="hard">🔴 難しい</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="p-2 border rounded-md"
                >
                  <option value="createdAt">作成日順</option>
                  <option value="title">タイトル順</option>
                  <option value="cookTime">調理時間順</option>
                  <option value="rating">評価順</option>
                </select>
              </div>
            </div>

            {/* レシピ一覧 */}
            <div className="mb-4 text-gray-600">
              {filteredAndSortedRecipes.length}件のレシピ
            </div>

            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedRecipes.map((recipe) => (
                  <div key={recipe.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold">{recipe.title}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editRecipe(recipe)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteRecipe(recipe.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{recipe.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {recipe.category}
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                          {getDifficultyIcon(recipe.difficulty)} {getDifficultyText(recipe.difficulty)}
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          ⏱️ {recipe.cookTime}分
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                          👥 {recipe.servings}人前
                        </span>
                      </div>

                      {recipe.rating && (
                        <div className="mb-4">
                          {'⭐'.repeat(recipe.rating)}
                        </div>
                      )}

                      {recipe.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {recipe.tags.map(tag => (
                            <span key={tag} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedRecipes.map((recipe) => (
                  <div key={recipe.id} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{recipe.title}</h3>
                        <p className="text-gray-600 mb-2">{recipe.description}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>{recipe.category}</span>
                          <span>{getDifficultyIcon(recipe.difficulty)} {getDifficultyText(recipe.difficulty)}</span>
                          <span>⏱️ {recipe.cookTime}分</span>
                          <span>👥 {recipe.servings}人前</span>
                          {recipe.rating && <span>{'⭐'.repeat(recipe.rating)}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editRecipe(recipe)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => deleteRecipe(recipe.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* レシピフォーム */
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingRecipe ? 'レシピを編集' : '新しいレシピ'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* 基本情報 */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">基本情報</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-1">タイトル *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    placeholder="美味しいカレー"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">説明</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="どんな料理か簡単に説明してください"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">カテゴリ</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">選択してください</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">難易度</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value as Recipe['difficulty']})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="easy">🟢 簡単</option>
                      <option value="medium">🟡 普通</option>
                      <option value="hard">🔴 難しい</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">調理時間 (分)</label>
                    <input
                      type="number"
                      value={formData.cookTime}
                      onChange={(e) => setFormData({...formData, cookTime: Number(e.target.value)})}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">人数</label>
                    <input
                      type="number"
                      value={formData.servings}
                      onChange={(e) => setFormData({...formData, servings: Number(e.target.value)})}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">評価</label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value={1}>⭐</option>
                      <option value={2}>⭐⭐</option>
                      <option value={3}>⭐⭐⭐</option>
                      <option value={4}>⭐⭐⭐⭐</option>
                      <option value={5}>⭐⭐⭐⭐⭐</option>
                    </select>
                  </div>
                </div>

                {/* タグ */}
                <div>
                  <label className="block text-sm font-medium mb-1">タグ</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="flex-1 p-2 border rounded-md"
                      placeholder="タグを追加"
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <button
                      onClick={addTag}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
                    >
                      追加
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags?.map(tag => (
                      <span key={tag} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="text-red-600">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 材料と手順 */}
              <div className="space-y-6">
                {/* 材料 */}
                <div>
                  <h3 className="text-lg font-bold mb-3">材料 *</h3>
                  <div className="grid grid-cols-12 gap-2 mb-2">
                    <input
                      type="text"
                      value={newIngredient.name}
                      onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                      className="col-span-5 p-2 border rounded-md"
                      placeholder="材料名"
                    />
                    <input
                      type="text"
                      value={newIngredient.amount}
                      onChange={(e) => setNewIngredient({...newIngredient, amount: e.target.value})}
                      className="col-span-3 p-2 border rounded-md"
                      placeholder="分量"
                    />
                    <input
                      type="text"
                      value={newIngredient.unit}
                      onChange={(e) => setNewIngredient({...newIngredient, unit: e.target.value})}
                      className="col-span-2 p-2 border rounded-md"
                      placeholder="単位"
                    />
                    <button
                      onClick={addIngredient}
                      className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-2 rounded text-sm"
                    >
                      追加
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {formData.ingredients?.map(ingredient => (
                      <div key={ingredient.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{ingredient.name} - {ingredient.amount} {ingredient.unit}</span>
                        <button
                          onClick={() => removeIngredient(ingredient.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          削除
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 手順 */}
                <div>
                  <h3 className="text-lg font-bold mb-3">調理手順 *</h3>
                  <div className="grid grid-cols-12 gap-2 mb-2">
                    <textarea
                      value={newStep.instruction}
                      onChange={(e) => setNewStep({...newStep, instruction: e.target.value})}
                      className="col-span-8 p-2 border rounded-md"
                      placeholder="手順を入力"
                      rows={2}
                    />
                    <input
                      type="number"
                      value={newStep.time}
                      onChange={(e) => setNewStep({...newStep, time: Number(e.target.value)})}
                      className="col-span-2 p-2 border rounded-md"
                      placeholder="時間(分)"
                    />
                    <button
                      onClick={addStep}
                      className="col-span-2 bg-green-600 hover:bg-green-700 text-white px-2 py-2 rounded text-sm"
                    >
                      追加
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {formData.steps?.map(step => (
                      <div key={step.id} className="flex justify-between items-start p-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="font-medium">手順 {step.order}</div>
                          <div className="text-gray-700">{step.instruction}</div>
                          {step.time && <div className="text-sm text-gray-500">⏱️ {step.time}分</div>}
                        </div>
                        <button
                          onClick={() => removeStep(step.id)}
                          className="text-red-600 hover:text-red-800 ml-2"
                        >
                          削除
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* メモ */}
                <div>
                  <label className="block text-sm font-medium mb-1">メモ・コツ</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="作り方のコツや注意点など"
                  />
                </div>
              </div>
            </div>

            {/* 保存ボタン */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={resetForm}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
              >
                キャンセル
              </button>
              <button
                onClick={saveRecipe}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold"
              >
                {editingRecipe ? '更新' : '保存'}
              </button>
            </div>
          </div>
        )}

        <footer className="mt-12 text-center text-gray-500">
          <p>レシピ管理帳</p>
          <p className="mt-2">美味しい思い出をまとめて保存！ 👩‍🍳</p>
        </footer>
      </div>
    </div>
  );
};

export default RecipeManager;