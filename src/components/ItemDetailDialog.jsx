import React from 'react';
import { resolveUrl } from '../utils';
import { Dialog } from 'primereact/dialog';
import { Rating } from 'primereact/rating';
import { Button } from 'primereact/button';

function ItemDetailDialog({ item, visible, onHide, onDelete, isOwner }) {
  if (!item) return null;

  const headerTemplate = () => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span style={{ fontSize: '20px', fontWeight: 600 }}>Детали подарка</span>
        {isOwner && onDelete && (
          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-button-text p-button-danger"
            onClick={() => { onDelete(item.id); onHide(); }}
            tooltip="Удалить подарок"
            tooltipOptions={{ position: 'bottom' }}
            style={{ marginRight: '8px' }}
          />
        )}
      </div>
    );
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      style={{ width: '700px', maxWidth: '90vw' }}
      header={headerTemplate()}
      closable
      headerStyle={{ padding: '1.5rem', borderBottom: '1px solid #e0e0e0' }}
      contentStyle={{ padding: '2rem' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Изображение */}
        <div style={{ 
          width: '100%', 
          height: '400px', 
          background: '#f5f5f5',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {item.imageUrl ? (
            <img
              src={resolveUrl(item.imageUrl)}
              alt={item.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          ) : (
            <i className="pi pi-image" style={{ fontSize: '4rem', color: '#ccc' }}></i>
          )}
        </div>

        {/* Название и рейтинг */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#000' }}>
            {item.title}
          </h2>
          {item.reservedByMe && (
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#e91e63',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 600
            }}>
              B
            </div>
          )}
        </div>

        {/* Рейтинг */}
        {item.priority && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Rating value={item.priority} readOnly cancel={false} />
          </div>
        )}

        {/* Цена и ссылка */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {item.price && (
            <div style={{ fontSize: '24px', fontWeight: 600, color: '#000' }}>
              {item.price} ₽
            </div>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: '#188700', 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '16px',
                fontWeight: 500
              }}
            >
              Ссылка <i className="pi pi-external-link"></i>
            </a>
          )}
        </div>

        {/* Комментарий */}
        {item.description && (
          <div>
            <div style={{ 
              fontSize: '14px', 
              color: '#999', 
              marginBottom: '8px',
              fontWeight: 500
            }}>
              Комментарий
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#666',
              lineHeight: '1.6'
            }}>
              {item.description}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}

export default ItemDetailDialog;
