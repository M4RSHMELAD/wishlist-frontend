import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { resolveUrl } from '../utils';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { ProgressSpinner } from 'primereact/progressspinner';
import { confirmDialog } from 'primereact/confirmdialog';
import { FileUpload } from 'primereact/fileupload';
import { Rating } from 'primereact/rating';
import ItemDetailDialog from './ItemDetailDialog';

const API_BASE = 'http://localhost:8081/api/v1';

function ItemsDialog({ wishlist, visible, onHide, toast, readOnly = false, onItemsChanged, user, breadcrumb }) {
  const canAdd = !readOnly;
  
  // Определяем является ли текущий пользователь владельцем вишлиста
  const currentUserId = user?.id;
  const isOwner = currentUserId && wishlist.userId && currentUserId === wishlist.userId;
  
  console.log('ItemsDialog DEBUG:', { 
    currentUserId, 
    wishlistUserId: wishlist.userId,
    user: user,
    isOwner 
  });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const fileUploadRef = useRef(null);
  const [formData, setFormData] = useState({ title: '', url: '', imageUrl: '', price: null, priority: 5, description: '' });

  useEffect(() => {
    if (visible) loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, wishlist.id]);
  
  if (!visible) return null;

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      const r = await axios.get(`${API_BASE}/wishlists/${wishlist.id}/items?page=1&per_page=100`, {
        headers: getAuthHeaders()
      });
      setItems(r.data.items || []);
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Ошибка загрузки', life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/wishlists/${wishlist.id}/items`, 
        { ...formData, wishlistId: wishlist.id },
        { headers: getAuthHeaders() }
      );
      setFormData({ title: '', url: '', imageUrl: '', price: null, priority: 5, description: '' });
      setShowAddForm(false);
      loadItems();
      toast.current?.show({ severity: 'success', summary: 'Элемент добавлен', life: 3000 });
      
      // Обновляем список вишлистов в родительском компоненте
      if (onItemsChanged) {
        onItemsChanged();
      }
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Ошибка', life: 3000 });
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.files[0];
    if (!file) return;
    console.log('ItemsDialog: Загружаем файл:', file.name, file.size, file.type);
    setUploadLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      console.log('ItemsDialog: Отправляем на сервер...');
      const r = await axios.post(`${API_BASE}/upload/image`, fd, { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          ...getAuthHeaders()
        } 
      });
      console.log('ItemsDialog: Файл загружен:', r.data);
      setFormData(prev => ({ ...prev, imageUrl: r.data.url }));
      if (fileUploadRef.current) fileUploadRef.current.clear();
      toast.current?.show({ severity: 'success', summary: 'Фото загружено', life: 3000 });
    } catch (error) {
      console.error('ItemsDialog: Ошибка загрузки фото:', error);
      toast.current?.show({ severity: 'error', summary: 'Ошибка загрузки фото', life: 3000 });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleTogglePurchased = async (item) => {
    try {
      await axios.patch(`${API_BASE}/wishlists/${wishlist.id}/items/${item.id}`, 
        { isPurchased: !item.isPurchased },
        { headers: getAuthHeaders() }
      );
      loadItems();
    } catch {}
  };

  const handleReserve = async (item, isIncognito = false) => {
    try {
      const headers = getAuthHeaders();
      console.log('Reserve headers:', headers);
      await axios.post(`${API_BASE}/wishlists/${wishlist.id}/items/${item.id}/reserve`, 
        { isIncognito },
        { headers }
      );
      loadItems();
      toast.current?.show({ severity: 'success', summary: isIncognito ? 'Забронировано инкогнито' : 'Забронировано', life: 3000 });
    } catch (error) {
      console.error('Reserve error:', error.response?.data || error.message);
      toast.current?.show({ severity: 'error', summary: 'Ошибка бронирования', life: 3000 });
    }
  };

  const handleUnreserve = async (item) => {
    try {
      await axios.delete(`${API_BASE}/wishlists/${wishlist.id}/items/${item.id}/reserve`, {
        headers: getAuthHeaders()
      });
      loadItems();
      toast.current?.show({ severity: 'success', summary: 'Бронирование снято', life: 3000 });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Ошибка', life: 3000 });
    }
  };

  const handleDeleteItem = (itemId) => {
    confirmDialog({
      message: 'Удалить этот элемент?',
      header: 'Подтверждение',
      acceptLabel: 'Да',
      rejectLabel: 'Нет',
      accept: async () => {
        try {
          await axios.delete(`${API_BASE}/wishlists/${wishlist.id}/items/${itemId}`, {
            headers: getAuthHeaders()
          });
          loadItems();
          
          // Обновляем список вишлистов в родительском компоненте
          if (onItemsChanged) {
            onItemsChanged();
          }
        } catch {}
      }
    });
  };

  return (
    <div className="items-page-container">
      {showAddForm ? (
        <>
          {/* Хлебные крошки для формы добавления */}
          <div className="breadcrumbs">
            <i className="pi pi-home" onClick={onHide}></i>
            <i className="pi pi-angle-right"></i>
            <span className="clickable" onClick={onHide}>{breadcrumb || 'Мои вишлисты'}</span>
            <i className="pi pi-angle-right"></i>
            <span className="clickable" onClick={() => setShowAddForm(false)}>{wishlist.title || wishlist.name}</span>
            <i className="pi pi-angle-right"></i>
            <span>Добавить подарок</span>
          </div>

          {/* Заголовок */}
          <h2 style={{ fontStyle: 'normal', fontSize: '24.5px', fontWeight: 600, marginBottom: '1.5rem', marginTop: '1.5rem' }}>
            Добавить подарок:
          </h2>

          {/* Форма добавления подарка */}
          <div className="items-dialog-container">
            <form onSubmit={handleAddItem}>
              <div className="flex flex-column gap-3">
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Название подарка *</label>
                  <InputText 
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })} 
                    placeholder="Введите название" 
                    required 
                    className="w-full" 
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Ссылка на товар</label>
                  <InputText 
                    value={formData.url} 
                    onChange={e => setFormData({ ...formData, url: e.target.value })} 
                    placeholder="https://..." 
                    className="w-full" 
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Цена (₽)</label>
                  <InputNumber 
                    value={formData.price} 
                    onValueChange={e => setFormData({ ...formData, price: e.value })} 
                    placeholder="0" 
                    className="w-full" 
                    minFractionDigits={0} 
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Приоритет (важность)</label>
                  <Rating 
                    value={formData.priority} 
                    onChange={e => setFormData({ ...formData, priority: e.value })} 
                    cancel={false}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Комментарий</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Добавьте комментарий к подарку"
                    rows={3}
                    className="p-inputtextarea p-inputtext p-component"
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Изображение подарка</label>
                  <FileUpload 
                    ref={fileUploadRef} 
                    mode="basic" 
                    name="file" 
                    accept="image/*" 
                    maxFileSize={5000000} 
                    onSelect={handleImageUpload} 
                    chooseLabel="Выбрать фото" 
                    disabled={uploadLoading}
                    auto
                    customUpload
                    uploadHandler={handleImageUpload}
                    chooseOptions={{
                      className: 'image-upload-area-button',
                      style: { display: 'none' }
                    }}
                  />
                  <div 
                    className="image-upload-area"
                    onClick={() => fileUploadRef.current?.getInput()?.click()}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="pi pi-upload" style={{ fontSize: '32px', color: '#666' }}></i>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
                      Чтобы загрузить файлы кликните или перетащите их в эту область
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
                      Можно загрузить не более 1 файла
                    </p>
                  </div>
                  {formData.imageUrl && (
                    <div style={{ marginTop: '12px', position: 'relative', display: 'inline-block' }}>
                      <img 
                        src={resolveUrl(formData.imageUrl)} 
                        alt="preview" 
                        style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} 
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  label="Сохранить" 
                  icon="pi pi-check" 
                  disabled={uploadLoading}
                  className="save-gift-button"
                  style={{ marginTop: '12px' }}
                />
              </div>
            </form>
          </div>
        </>
      ) : (
        <>
          {/* Хлебные крошки для списка подарков */}
          <div className="breadcrumbs">
            <i className="pi pi-home" onClick={onHide}></i>
            <i className="pi pi-angle-right"></i>
            <span className="clickable" onClick={onHide}>{breadcrumb || 'Мои вишлисты'}</span>
            <i className="pi pi-angle-right"></i>
            <span>{wishlist.title || wishlist.name}</span>
          </div>

          {/* Заголовок с кнопкой добавить */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontStyle: 'normal', fontSize: '24.5px', fontWeight: 600, margin: 0 }}>
              {wishlist.title || wishlist.name}:
            </h2>
            {canAdd && (
              <Button
                label="Добавить подарок"
                icon="pi pi-plus"
                onClick={() => setShowAddForm(true)}
                className="custom-green-button"
              />
            )}
          </div>

          {/* Сортировка */}
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>Сортировать по:</span>
          </div>

          {/* Список подарков */}
          {loading ? (
            <div className="flex justify-content-center p-4"><ProgressSpinner /></div>
          ) : items.length === 0 ? (
            <p className="text-center text-color-secondary">Список пуст. Добавьте первый подарок!</p>
          ) : (
            <div className="items-grid">
              {items.map(item => {
                console.log('Item:', item.id, { isOwner, isReserved: item.isReserved, reservedByMe: item.reservedByMe });
                return (
                  <div key={item.id} className="item-card">
                    {/* Изображение */}
                    <div className="item-card-image" onClick={() => setSelectedItem(item)}>
                      {item.imageUrl ? (
                        <img 
                          src={resolveUrl(item.imageUrl)}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            console.error('Image load error:', item.imageUrl);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="item-card-no-image">
                          <i className="pi pi-gift" style={{ fontSize: '48px' }}></i>
                        </div>
                      )}
                    </div>

                    {/* Рейтинг звездами */}
                    <div className="item-card-rating">
                      <Rating value={item.priority || 3} readOnly cancel={false} />
                    </div>

                    {/* Цена */}
                    {item.price && (
                      <div className="item-card-price">{item.price} ₽</div>
                    )}

                    {/* Название */}
                    <div className="item-card-title">{item.title}</div>

                    {/* Статусы */}
                    {item.isReserved && !item.reservedByMe && (
                      <div className="item-card-status reserved">🔒 Забронировано</div>
                    )}
                    {item.reservedByMe && (
                      <div className="item-card-status reserved-by-me">✓ Вы забронировали</div>
                    )}
                    {item.isPurchased && (
                      <div className="item-card-status purchased">✓ Подарено</div>
                    )}

                    {/* Кнопки действий */}
                    <div className="item-card-actions">
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <Button icon="pi pi-external-link" className="p-button-text p-button-sm" tooltip="Открыть ссылку" />
                        </a>
                      )}
                      
                      {!isOwner && (
                        <>
                          {item.reservedByMe ? (
                            <Button
                              icon="pi pi-times"
                              className="p-button-sm p-button-warning"
                              tooltip="Снять бронь"
                              onClick={() => handleUnreserve(item)}
                            />
                          ) : !item.isReserved ? (
                            <>
                              <Button
                                icon="pi pi-bookmark"
                                className="p-button-sm p-button-success"
                                tooltip="Забронировать"
                                onClick={() => handleReserve(item, false)}
                              />
                              <Button
                                icon="pi pi-eye-slash"
                                className="p-button-sm p-button-help"
                                tooltip="Забронировать инкогнито"
                                onClick={() => handleReserve(item, true)}
                              />
                            </>
                          ) : null}
                          <Button
                            icon={item.isPurchased ? 'pi pi-undo' : 'pi pi-gift'}
                            className={`p-button-sm ${item.isPurchased ? 'p-button-warning' : 'p-button-info'}`}
                            tooltip={item.isPurchased ? 'Отменить' : 'Подарю это'}
                            onClick={() => handleTogglePurchased(item)}
                          />
                        </>
                      )}
                      
                      {isOwner && (
                        <>
                          <Button 
                            icon={item.isPurchased ? 'pi pi-undo' : 'pi pi-check'} 
                            className={`p-button-sm ${item.isPurchased ? 'p-button-warning' : 'p-button-success'}`} 
                            onClick={() => handleTogglePurchased(item)}
                            tooltip={item.isPurchased ? 'Отменить' : 'Отметить как подаренное'}
                          />
                          <Button 
                            icon="pi pi-trash" 
                            className="p-button-sm p-button-danger p-button-text" 
                            onClick={() => handleDeleteItem(item.id)}
                            tooltip="Удалить"
                          />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <ItemDetailDialog
        item={selectedItem}
        visible={!!selectedItem}
        onHide={() => setSelectedItem(null)}
        onDelete={handleDeleteItem}
        isOwner={isOwner}
      />
    </div>
  );
}

export default ItemsDialog;
