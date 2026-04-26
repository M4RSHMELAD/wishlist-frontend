import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

function WishlistDialog({ visible, onHide, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: null,
    privacyLevel: 'friends_only'
  });

  const privacyOptions = [
    { label: 'Только друзья', value: 'friends_only' },
    { label: 'Публичный (виден всем)', value: 'public' },
    { label: 'По ссылке', value: 'link_only' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      title: formData.title,
      description: formData.description || undefined,
      eventDate: formData.eventDate ? formData.eventDate.toISOString().split('T')[0] : undefined,
      privacyLevel: formData.privacyLevel || 'friends_only',
      isPublic: formData.privacyLevel === 'public',
    };
    onSubmit(submitData);
    setFormData({ title: '', description: '', eventDate: null, privacyLevel: 'friends_only' });
  };

  return (
    <Dialog 
      header="Создать вишлист:" 
      visible={visible} 
      style={{ width: '600px' }} 
      onHide={onHide}
      headerStyle={{ fontStyle: 'italic', fontSize: '1.5rem', fontWeight: 600 }}
    >
      <form onSubmit={handleSubmit}>
        <div className="field" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#555' }}>
            Название вишлиста
          </label>
          <InputText 
            id="title" 
            value={formData.title} 
            onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
            required 
            className="w-full" 
            placeholder="Например: Сладкие мечты, Коллекция лего и тд." 
            style={{ padding: '0.75rem' }}
          />
          <small style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Это обязательное поле для заполнения</small>
        </div>

        <div className="field" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#555' }}>
            Описание
          </label>
          <InputTextarea 
            id="description" 
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            rows={4} 
            className="w-full" 
            placeholder="Напишите краткое описание своих желаний или приветственное сообщение друзьям !" 
            style={{ padding: '0.75rem' }}
          />
        </div>

        <div className="field" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="eventDate" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#555' }}>
            Дата события
          </label>
          <small style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            Выберам дату, если подарок нужен к определённому дню
          </small>
          <Calendar 
            id="eventDate" 
            value={formData.eventDate} 
            onChange={(e) => setFormData({ ...formData, eventDate: e.value })} 
            className="w-full" 
            placeholder="Выберите дату" 
            dateFormat="dd.mm.yy" 
            showIcon 
          />
        </div>

        <div className="field" style={{ marginBottom: '2rem' }}>
          <label htmlFor="privacyLevel" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#555' }}>
            Приватность
          </label>
          <Dropdown 
            id="privacyLevel" 
            value={formData.privacyLevel} 
            options={privacyOptions} 
            onChange={(e) => setFormData({ ...formData, privacyLevel: e.value })} 
            className="w-full" 
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button 
            label="Отмена" 
            type="button"
            onClick={onHide} 
            className="p-button-text" 
            style={{ color: '#64748b' }}
          />
          <Button 
            label="Сохранить" 
            type="submit"
            icon="pi pi-check"
            style={{ backgroundColor: '#18B700', border: 'none' }}
          />
        </div>
      </form>
    </Dialog>
  );
}

export default WishlistDialog;
