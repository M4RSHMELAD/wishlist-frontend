import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { resolveUrl } from './utils';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';
import { DataView } from 'primereact/dataview';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Avatar } from 'primereact/avatar';
import UserProfile from './components/UserProfile';
import UserProfileDialog from './components/UserProfileDialog';
import WishlistDialog from './components/WishlistDialog';
import ItemsDialog from './components/ItemsDialog';
import FriendsPanel from './components/FriendsPanel';
import FriendWishlists from './components/FriendWishlists';

// CDEK UI Kit стили
import '@cdek-it/react-ui-kit/dist/theme-light.css';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './App.css';

// Русская локализация для Calendar
addLocale('ru', {
  firstDayOfWeek: 1,
  dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  today: 'Сегодня',
  clear: 'Сбросить'
});

const API_BASE = 'http://localhost:8081/api/v1';

function MyWishlists({ user, toast, wishlistTemplate }) {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    axios.get(`${API_BASE}/wishlists?user_id=${user.id}&page=1&per_page=50`)
      .then(r => setWishlists(r.data.items || []))
      .catch(() => toast.current?.show({ severity: 'error', summary: 'Ошибка загрузки', life: 2000 }))
      .finally(() => setLoading(false));
  }, [user, toast]);

  if (loading) return <div className="flex justify-content-center p-4"><ProgressSpinner /></div>;

  if (wishlists.length === 0) return (
    <Card className="text-center">
      <h3>Нет вишлистов</h3>
      <p className="text-color-secondary">Вы ещё не создали ни одного вишлиста.</p>
    </Card>
  );

  return <DataView value={wishlists} itemTemplate={wishlistTemplate} layout="grid" />;
}

function FriendProfilePage({ friend, toast, onBack, onOpenWishlist }) {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/wishlists?user_id=${friend.id}&page=1&per_page=50`)
      .then(r => setWishlists(r.data.items || []))
      .catch(() => toast.current?.show({ severity: 'error', summary: 'Ошибка загрузки', life: 2000 }))
      .finally(() => setLoading(false));
  }, [friend.id, toast]);

  return (
    <>
      <div className="breadcrumbs">
        <i className="pi pi-home" onClick={onBack} style={{ cursor: 'pointer' }}></i>
        <i className="pi pi-angle-right"></i>
        <span className="clickable" onClick={onBack}>Друзья</span>
        <i className="pi pi-angle-right"></i>
        <span>{friend.fullName || friend.username}</span>
      </div>

      <div className="profile-card">
        <div className="profile-card-header" style={{ marginTop: '-24px' }}>
          <div className="profile-avatar-large">
            {friend.username?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-card-info">
            <h2>{friend.fullName || friend.username}</h2>
            <p className="profile-birthdate">
              {friend.birthDate ? `${new Date().getFullYear() - new Date(friend.birthDate).getFullYear()} лет` : ''}
            </p>
            <p className="profile-bio">{friend.bio || 'Личная информация отсутствует...'}</p>
          </div>
        </div>
      </div>

      <div className="wishlists-section">
        <div className="wishlists-header">
          <h3 style={{ marginTop: '-40px' }}>Активные вишлисты:</h3>
        </div>
        <div className="wishlists-grid">
          {loading ? (
            <div className="flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
              <ProgressSpinner />
            </div>
          ) : wishlists.length === 0 ? (
            <p className="text-color-secondary">Нет публичных вишлистов.</p>
          ) : (
            wishlists.map(wishlist => (
              <div key={wishlist.id} className="wishlist-card" onClick={() => onOpenWishlist(wishlist)} style={{ cursor: 'pointer' }}>
                <div className="wishlist-card-header">
                  <h4>{wishlist.title}</h4>
                </div>
                {wishlist.eventName && <p className="wishlist-event-name">{wishlist.eventName}</p>}
                <div className="wishlist-items-preview">
                  <div className="item-preview"><i className="pi pi-gift"></i></div>
                </div>
                <div className="wishlist-card-footer">
                  {wishlist.eventDate ? (
                    <span className="wishlist-date">{new Date(wishlist.eventDate).toLocaleDateString('ru-RU')}</span>
                  ) : (
                    <span className="wishlist-status">Бессрочно</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [wishlists, setWishlists] = useState([]);
  const [friendsWishlists, setFriendsWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    eventDate: null,
    privacyLevel: 'friends_only'
  });
  const [selectedWishlist, setSelectedWishlist] = useState(null);
  const [showItemsPage, setShowItemsPage] = useState(false);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [pendingCreateWishlist, setPendingCreateWishlist] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showEditProfilePage, setShowEditProfilePage] = useState(false);
  const [wishlistMenuOpen, setWishlistMenuOpen] = useState(null);
  const [editingWishlist, setEditingWishlist] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendWishlist, setFriendWishlist] = useState(null);
  const toast = React.useRef(null);

  // Восстанавливаем сессию при загрузке / обновлении страницы
  useEffect(() => {
    axios.defaults.withCredentials = true;
    axios.get(`${API_BASE}/auth/me`)
    .then(r => {
      const userData = r.data.user || r.data;
      setUser(userData);
      setToken('authenticated'); // Просто флаг, что пользователь авторизован
      
      // Проверяем, нужно ли открыть диалог создания вишлиста
      const shouldCreateWishlist = localStorage.getItem('pendingCreateWishlist');
      if (shouldCreateWishlist === 'true') {
        localStorage.removeItem('pendingCreateWishlist');
        setTimeout(() => setShowCreatePage(true), 500);
      }
    })
    .catch(() => {
      // Не авторизован - ничего не делаем
      setUser(null);
      setToken(null);
    });
}, []);


  useEffect(() => {
    if (user) {
      loadWishlists();
      loadFriendsWishlists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    // Устанавливаем заголовок сразу, не дожидаясь useEffect
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    toast.current?.show({
      severity: 'success',
      summary: 'Добро пожаловать!',
      detail: `Вы вошли как ${userData.username}`,
      life: 3000
    });
  };

  

  const handleLogout = async () => {
      try {
        await axios.post(`${API_BASE}/auth/logout`);
      } catch (error) {
        console.error('Ошибка при выходе:', error);
      }

      setUser(null);
      setToken(null);
      sessionStorage.setItem('logged_out', 'true');

      toast.current?.show({
        severity: 'info',
        summary: 'До свидания!',
        detail: 'Вы вышли из системы',
        life: 3000
      });
    };

  const handleGitHubLogin = () => {
    const afterLogout = sessionStorage.getItem('logged_out') === 'true';
    sessionStorage.removeItem('logged_out');
    const url = afterLogout
      ? 'http://localhost:8081/api/v1/auth/oauth/login?prompt=true'
      : 'http://localhost:8081/api/v1/auth/oauth/login';
    window.location.href = url;
  };

  const handleCreateWishlistClick = () => {
    if (user) {
      setShowCreatePage(true);
    } else {
      localStorage.setItem('pendingCreateWishlist', 'true');
      handleGitHubLogin();
    }
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      const response = await axios.patch(`${API_BASE}/auth/profile`, profileData);
      setUser(response.data.user);
      toast.current?.show({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Профиль обновлён',
        life: 3000
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Ошибка',
        detail: error.response?.data?.error || 'Не удалось обновить профиль',
        life: 3000
      });
      throw error;
    }
  };

  const loadWishlists = async () => {
    if (!token || !user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('loadWishlists: Загружаем вишлисты для user.id =', user.id);
      const response = await axios.get(`${API_BASE}/wishlists?user_id=${user.id}&page=1&per_page=50`);
      const wishlistsData = response.data.items || [];
      console.log('loadWishlists: Получено вишлистов:', wishlistsData.length);
      wishlistsData.forEach(w => console.log('  - Вишлист:', w.id, 'userId:', w.userId, 'title:', w.title));
      
      // Фильтруем только свои вишлисты на фронтенде
      const myWishlists = wishlistsData.filter(w => w.userId === user.id);
      console.log('loadWishlists: После фильтрации осталось:', myWishlists.length);
      
      // Загружаем items для каждого вишлиста
      const wishlistsWithItems = await Promise.all(
        myWishlists.map(async (wishlist) => {
          try {
            const itemsResponse = await axios.get(`${API_BASE}/wishlists/${wishlist.id}/items`);
            return {
              ...wishlist,
              items: itemsResponse.data.items || []
            };
          } catch (error) {
            console.error(`Ошибка загрузки items для вишлиста ${wishlist.id}:`, error);
            return {
              ...wishlist,
              items: []
            };
          }
        })
      );
      
      setWishlists(wishlistsWithItems);
    } catch (error) {
      console.error('Ошибка загрузки вишлистов:', error);
      if (error.response?.status === 401) {
        handleLogout();
        toast.current?.show({
          severity: 'warn',
          summary: 'Сессия истекла',
          detail: 'Пожалуйста, войдите снова',
          life: 3000
        });
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Ошибка',
          detail: 'Не удалось загрузить вишлисты',
          life: 3000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFriendsWishlists = async () => {
    if (!token || !user) {
      console.log('loadFriendsWishlists: Нет токена или пользователя');
      return;
    }
    
    try {
      console.log('loadFriendsWishlists: Загружаем список друзей...');
      // Загружаем список друзей
      const friendsResponse = await axios.get(`${API_BASE}/friends`);
      const friends = friendsResponse.data.items || [];
      console.log('loadFriendsWishlists: Найдено друзей:', friends.length);
      
      // Загружаем вишлисты всех друзей
      const allFriendsWishlists = [];
      
      for (const friend of friends) {
        console.log('loadFriendsWishlists: Загружаем вишлисты друга:', friend.id, friend.fullName || friend.username);
        try {
          const wishlistsResponse = await axios.get(`${API_BASE}/wishlists?user_id=${friend.id}&page=1&per_page=50`);
          const friendWishlists = wishlistsResponse.data.items || [];
          console.log('  - Найдено вишлистов:', friendWishlists.length);
          
          // Фильтруем по приватности и загружаем items
          for (const wishlist of friendWishlists) {
            console.log('  - Вишлист:', wishlist.title, 'privacyLevel:', wishlist.privacyLevel);
            // Показываем только публичные или для друзей
            if (wishlist.privacyLevel === 'public' || wishlist.privacyLevel === 'friends_only') {
              try {
                const itemsResponse = await axios.get(`${API_BASE}/wishlists/${wishlist.id}/items`);
                allFriendsWishlists.push({
                  ...wishlist,
                  items: itemsResponse.data.items || [],
                  ownerName: friend.fullName || friend.username
                });
                console.log('    ✓ Добавлен в список');
              } catch (error) {
                console.error(`Ошибка загрузки items для вишлиста ${wishlist.id}:`, error);
              }
            } else {
              console.log('    ✗ Пропущен (приватный)');
            }
          }
        } catch (error) {
          console.error(`Ошибка загрузки вишлистов друга ${friend.id}:`, error);
        }
      }
      
      console.log('loadFriendsWishlists: Итого вишлистов друзей:', allFriendsWishlists.length);
      setFriendsWishlists(allFriendsWishlists);
    } catch (error) {
      console.error('Ошибка загрузки вишлистов друзей:', error);
    }
  };

  const handleCreateWishlist = async (data) => {
    try {
      console.log('User при создании:', user);
      console.log('Token:', localStorage.getItem('token') ? 'есть' : 'нет');
      console.log('Axios заголовок:', axios.defaults.headers.common['Authorization'] ? 'есть' : 'нет');
      
      const wishlistData = {
        title: data.title,
        description: data.description || undefined,
        eventName: data.eventName || undefined,
        eventDate: data.eventDate || undefined,
        privacyLevel: data.privacyLevel || 'friends_only',
        isPublic: data.isPublic || false,
        imageUrl: data.imageUrl || undefined,
      };
      console.log('Создаем вишлист с данными:', wishlistData);
      
      await axios.post(`${API_BASE}/wishlists`, wishlistData);
      
      setShowCreateDialog(false);
      setShowCreatePage(false);
      loadWishlists();
      toast.current?.show({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Вишлист успешно создан',
        life: 3000
      });
    } catch (error) {
      console.error('Ошибка создания вишлиста:', error);
      console.error('Детали ошибки:', error.response?.data);
      console.error('Статус:', error.response?.status);
      console.error('Заголовки запроса:', error.config?.headers);
      const errMsg = error.response?.data?.error || error.response?.data?.message || `Ошибка ${error.response?.status || ''}: Не удалось создать вишлист`;
      toast.current?.show({
        severity: 'error',
        summary: 'Ошибка',
        detail: errMsg,
        life: 5000
      });
    }
  };

  const handleDeleteWishlist = (id) => {
    confirmDialog({
      message: 'Вы уверены, что хотите удалить этот вишлист?',
      header: 'Подтверждение удаления',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Да',
      rejectLabel: 'Нет',
      accept: async () => {
        try {
          await axios.delete(`${API_BASE}/wishlists/${id}`);
          loadWishlists();
          setWishlistMenuOpen(null);
          toast.current?.show({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Вишлист удален',
            life: 3000
          });
        } catch (error) {
          console.error('Ошибка удаления вишлиста:', error);
          toast.current?.show({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось удалить вишлист',
            life: 3000
          });
        }
      }
    });
  };

  const handleEditWishlist = (wishlist) => {
    setEditingWishlist(wishlist);
    setCreateFormData({
      title: wishlist.name || wishlist.title || '',
      description: wishlist.description || '',
      eventDate: wishlist.eventDate ? new Date(wishlist.eventDate) : null,
      privacyLevel: wishlist.privacyLevel || 'friends_only'
    });
    setShowCreatePage(true);
    setWishlistMenuOpen(null);
  };

  const handleUpdateWishlist = async (data) => {
    try {
      console.log('Обновление вишлиста:', editingWishlist.id);
      console.log('Данные для обновления:', data);
      
      const wishlistData = {
        title: data.title,
        description: data.description || '',
        eventDate: data.eventDate || null,
        privacyLevel: data.privacyLevel || 'friends_only',
        isPublic: data.privacyLevel === 'public',
      };
      
      console.log('Отправляемые данные:', wishlistData);
      
      const response = await axios.patch(`${API_BASE}/wishlists/${editingWishlist.id}`, wishlistData);
      console.log('Ответ сервера:', response.data);
      
      setShowCreatePage(false);
      setEditingWishlist(null);
      setCreateFormData({ title: '', description: '', eventDate: null, privacyLevel: 'friends_only' });
      loadWishlists();
      toast.current?.show({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Вишлист успешно обновлен',
        life: 3000
      });
    } catch (error) {
      console.error('Ошибка обновления вишлиста:', error);
      console.error('Детали ошибки:', error.response?.data);
      console.error('Статус:', error.response?.status);
      const errMsg = error.response?.data?.error || error.response?.data?.message || 'Не удалось обновить вишлист';
      toast.current?.show({
        severity: 'error',
        summary: 'Ошибка',
        detail: errMsg,
        life: 5000
      });
    }
  };

  const handleShareWishlist = (wishlist) => {
    const url = `${window.location.origin}/wishlist/${wishlist.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setWishlistMenuOpen(null);
      toast.current?.show({
        severity: 'success',
        summary: 'Скопировано',
        detail: 'Ссылка на вишлист скопирована в буфер обмена',
        life: 3000
      });
    }).catch(() => {
      toast.current?.show({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось скопировать ссылку',
        life: 3000
      });
    });
  };

  const wishlistTemplate = (wishlist) => {
    return (
      <Card
        title={
          <div className="flex align-items-center gap-2">
            <span>{wishlist.title}</span>
          </div>
        }
        subTitle={wishlist.description}
        className="m-2"
        footer={
          <div className="flex gap-2">
            <Button
              label="Открыть"
              icon="pi pi-eye"
              onClick={() => setSelectedWishlist(wishlist)}
              className="p-button-primary"
            />
            <Button
              label="Удалить"
              icon="pi pi-trash"
              onClick={() => handleDeleteWishlist(wishlist.id)}
              className="p-button-danger"
            />
          </div>
        }
      >
        {wishlist.imageUrl && (
          <div className="mb-3">
            <img 
              src={resolveUrl(wishlist.imageUrl)} 
              alt={wishlist.title}
              style={{ 
                width: '100%', 
                maxHeight: '200px', 
                objectFit: 'cover',
                borderRadius: '4px'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        {wishlist.author && (
          <div
            className="flex align-items-center gap-2 mb-2"
            style={{ fontSize: '13px', color: '#666', cursor: 'pointer' }}
            onClick={() => setAuthorProfile(wishlist.author)}
          >
            <Avatar
              label={wishlist.author.username?.charAt(0).toUpperCase()}
              shape="circle"
              size="small"
              style={{ background: '#e0e0e0', color: '#333', width: '24px', height: '24px', fontSize: '11px' }}
            />
            <span>{wishlist.author.fullName || wishlist.author.username}</span>
          </div>
        )}
        <div className="flex align-items-center gap-3">
          <span className={`pi ${wishlist.isPublic ? 'pi-globe' : 'pi-lock'}`}></span>
          <span>{wishlist.isPublic ? 'Публичный' : 'Приватный'}</span>
        </div>
        {wishlist.eventName && (
          <div className="flex align-items-center gap-3 mt-2">
            <span className="pi pi-calendar"></span>
            <span>{wishlist.eventName}</span>
            {wishlist.eventDate && (
              <span className="text-color-secondary">
                ({new Date(wishlist.eventDate).toLocaleDateString('ru-RU')})
              </span>
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="header-wrapper">
        <div className="surface-0">
          <div className="flex align-items-center" style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', padding: '1rem 2rem' }}>
            <div className="flex align-items-center">
              <img 
                src="/images/logo.svg" 
                alt="CDEK WISH" 
                style={{ height: '18px', width: '143px' }}
              />
            </div>
            <div className="flex gap-2 align-items-center" style={{ marginLeft: 'auto' }}>
              {user ? (
                <>
                  <button 
                    className="icon-button-header"
                    title="Уведомления"
                  >
                    <i className="pi pi-bell"></i>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="icon-button-header"
                    title="Выйти"
                  >
                    <i className="pi pi-sign-out"></i>
                  </button>
                </>
              ) : (
                <>
                  <Button
                    label="Создать вишлист"
                    onClick={handleCreateWishlistClick}
                    className="custom-outline-button"
                  />
                  <Button
                    label="Войти"
                    onClick={handleGitHubLogin}
                    className="custom-green-button"              
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`app-background ${user ? 'app-background-logged-in' : 'app-background-guest'}`}>
        <div className="app">

      {!user && (
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Добро пожаловать<br />в мир вишлистов!</h1>
              <p>Здесь живут наши мечты, которые мы превращаем в реальность, радуя друг друга особенными подарками</p>
              <button className="hero-button" onClick={handleCreateWishlistClick}>Создать вишлист</button>
            </div>
            
            <div className="hero-images">
              <img src="/images/chel.svg" alt="Персонаж" className="hero-character" />
              <img src="/images/zvezda1.svg" alt="" className="hero-star hero-star-1" />
              <img src="/images/zvezda2.svg" alt="" className="hero-star hero-star-2" />
              <img src="/images/zvezda3.svg" alt="" className="hero-star hero-star-3" />
              <img src="/images/zvezda4.svg" alt="" className="hero-star hero-star-4" />
              <img src="/images/zvezda5.svg" alt="" className="hero-star hero-star-5" />
              <img src="/images/zvezda6.svg" alt="" className="hero-star hero-star-6" />
              <img src="/images/zvezda7.svg" alt="" className="hero-star hero-star-7" />
              <img src="/images/zvezda8.svg" alt="" className="hero-star hero-star-8" />
              <img src="/images/krosi.svg" alt="" className="hero-sneakers" />
              <img src="/images/naush.svg" alt="" className="hero-headphones" />
              <img src="/images/phone.svg" alt="" className="hero-phone" />
            </div>
          </div>
        </div>
      )}

      {!user && (
        <div className="how-to-section">
          <div className="how-to-container">
            <h2 className="how-to-title">Как создать вишлист?</h2>
            
            <div className="how-to-cards">
              <div className="how-to-card">
                <div className="card-image"></div>
                <h3>Шаг 1</h3>
                <p>Авторизуйтесь, чтобы создать личное пространство для желаний</p>
              </div>
              
              <div className="how-to-card">
                <div className="card-image"></div>
                <h3>Шаг 2</h3>
                <p>Перейдите в раздел Вишлисты в своём профиле</p>
              </div>
              
              <div className="how-to-card">
                <div className="card-image"></div>
                <h3>Шаг 3</h3>
                <p>Создайте вишлист и добавьте туда желаемые подарки</p>
              </div>
            </div>
            
            <div className="how-to-cards how-to-cards-bottom">
              <div className="how-to-card">
                <div className="card-image"></div>
                <h3>Шаг 4</h3>
                <p>Поставьте метку «Главная мечта», чтобы друзья знали, что дарить в первую очередь</p>
              </div>
              
              <div className="how-to-card">
                <div className="card-image"></div>
                <h3>Шаг 5</h3>
                <p>Поделитесь ссылкой на вишлист с друзьями и близкими</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!user && (
        <div className="holiday-section">
          <div className="holiday-container">
            <div className="holiday-content">
              <div className="holiday-text">
                <h2>Создай праздник, о котором мечтаешь!</h2>
                <p>Каждый момент должен быть наполнен радостью. Сделай этот праздник идеальным с помощью своего вишлиста.</p>
                <button className="holiday-button" onClick={handleCreateWishlistClick}>Создать вишлист</button>
              </div>
              <img src="/images/podarki.svg" alt="Подарки" className="holiday-gifts" />
            </div>
          </div>
        </div>
      )}

      {!user ? (
        <div></div>
      ) : (
        <div className="main-content-wrapper">
          <div className="sidebar-profile">
            <div className="profile-header">
              <div className="profile-avatar-small">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="profile-info-small">
                <h4>{user.fullName || user.username || 'Пользователь'}</h4>
                <p>{user.birthDate ? new Date(user.birthDate).toLocaleDateString('ru-RU') : ''}</p>
              </div>
            </div>
            
            <div className="profile-menu">
              <button 
                className={`profile-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => { 
                  setActiveTab('profile'); 
                  setSelectedFriend(null); 
                  setFriendWishlist(null);
                  setShowItemsPage(false);
                  setSelectedWishlist(null);
                }}
              >
                <i className="pi pi-user"></i>
                <span>Моя страница</span>
              </button>
              <button className="profile-menu-item">
                <i className="pi pi-gift"></i>
                <span>Идеи подарков</span>
              </button>
              <button 
                className={`profile-menu-item ${activeTab === 'friends' ? 'active' : ''}`}
                onClick={() => { 
                  setActiveTab('friends'); 
                  setSelectedFriend(null); 
                  setFriendWishlist(null);
                  setShowItemsPage(false);
                  setSelectedWishlist(null);
                }}
              >
                <i className="pi pi-users"></i>
                <span>Друзья</span>
              </button>
              <button className="profile-menu-item">
                <i className="pi pi-cog"></i>
                <span>Настройки</span>
              </button>
            </div>
          </div>
          
          <div className="main-content">
            {showEditProfilePage ? (
              <>
                <div className="breadcrumbs">
                  <i className="pi pi-home" onClick={() => setShowEditProfilePage(false)}></i>
                  <i className="pi pi-angle-right"></i>
                  <span className="clickable" onClick={() => setShowEditProfilePage(false)}>Моя страница</span>
                  <i className="pi pi-angle-right"></i>
                  <span>Редактировать</span>
                </div>
                
                <h2 style={{ fontStyle: 'normal', fontSize: '24.5px', fontWeight: 600, marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                  Личные данные:
                </h2>
                
                <div className="create-wishlist-page">
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const payload = {
                      fullName: formData.get('fullName'),
                      birthDate: formData.get('birthDate') || undefined,
                      city: formData.get('city') || undefined,
                      phone: formData.get('phone') || undefined,
                      bio: formData.get('bio') || undefined,
                    };
                    try {
                      await handleUpdateProfile(payload);
                      setShowEditProfilePage(false);
                    } catch {}
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                      <div className="profile-avatar-large" style={{ marginBottom: '12px' }}>
                        {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <button 
                        type="button"
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          color: '#188700', 
                          fontSize: '14px',
                          fontWeight: 700,
                          width: '143px',
                          height: '14px',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Выберите фотографию
                      </button>
                    </div>

                    <div className="form-field">
                      <label>Полное имя</label>
                      <input
                        type="text"
                        name="fullName"
                        defaultValue={user.fullName || ''}
                        className="p-inputtext p-component"
                        placeholder="Введите ваше имя"
                      />
                    </div>

                    <div className="form-field">
                      <label>Дата рождения</label>
                      <input
                        type="date"
                        name="birthDate"
                        defaultValue={user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : ''}
                        className="p-inputtext p-component"
                      />
                    </div>

                    <div className="form-field">
                      <label>О себе</label>
                      <textarea
                        name="bio"
                        defaultValue={user.bio || ''}
                        rows={3}
                        className="p-inputtextarea p-inputtext p-component"
                        placeholder="Расскажите что-нибудь о себе"
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                      <Button
                        label="Отмена"
                        type="button"
                        onClick={() => setShowEditProfilePage(false)}
                        className="p-button-text"
                      />
                      <Button
                        label="Сохранить"
                        type="submit"
                        icon="pi pi-check"
                        className="custom-green-button"
                      />
                    </div>
                  </form>
                </div>
              </>
            ) : showCreatePage ? (
              <>
                <div className="breadcrumbs">
                  <i className="pi pi-home" onClick={() => {
                    setShowCreatePage(false);
                    setEditingWishlist(null);
                  }}></i>
                  <i className="pi pi-angle-right"></i>
                  <span className="clickable" onClick={() => {
                    setShowCreatePage(false);
                    setEditingWishlist(null);
                  }}>Мои вишлисты</span>
                  <i className="pi pi-angle-right"></i>
                  <span>Создать вишлист</span>
                </div>
                
                <h2 style={{ fontStyle: 'normal', fontSize: '24.5px', fontWeight: 600, marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                  {editingWishlist ? 'Редактировать вишлист:' : 'Создать вишлист:'}
                </h2>
                
                <div className="create-wishlist-page">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const submitData = {
                      title: createFormData.title,
                      description: createFormData.description || undefined,
                      eventDate: createFormData.eventDate ? createFormData.eventDate.toISOString().split('T')[0] : undefined,
                      privacyLevel: createFormData.privacyLevel || 'friends_only',
                      isPublic: createFormData.privacyLevel === 'public',
                    };
                    if (editingWishlist) {
                      handleUpdateWishlist(submitData);
                    } else {
                      handleCreateWishlist(submitData);
                    }
                    setCreateFormData({ title: '', description: '', eventDate: null, privacyLevel: 'friends_only' });
                  }}>
                    <div className="form-field">
                      <label>Название вишлиста</label>
                      <input
                        type="text"
                        value={createFormData.title}
                        onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                        required
                        className="p-inputtext p-component"
                        placeholder="Например: Сладкие мечты, Коллекция лего и тд."
                      />
                    </div>

                    <div className="form-field">
                      <label>Описание</label>
                      <textarea
                        value={createFormData.description}
                        onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                        rows={5}
                        className="p-inputtextarea p-inputtext p-component"
                        placeholder="Напишите краткое описание своих желаний или приветственное сообщение друзьям !"
                      />
                    </div>

                    <div className="form-field">
                      <label>Дата события</label>
                      <small>Выберам дату, если подарок нужен к определённому дню</small>
                      <Calendar
                        value={createFormData.eventDate}
                        onChange={(e) => setCreateFormData({ ...createFormData, eventDate: e.value })}
                        placeholder="Выберите дату"
                        dateFormat="dd.mm.yy"
                        showIcon
                        showButtonBar
                        todayButtonClassName="p-button-text"
                        clearButtonClassName="p-button-text"
                        locale="ru"
                        className="w-full"
                      />
                    </div>

                    <div className="form-field">
                      <label>Приватность</label>
                      <select
                        value={createFormData.privacyLevel}
                        onChange={(e) => setCreateFormData({ ...createFormData, privacyLevel: e.target.value })}
                        className="p-dropdown p-component p-inputwrapper"
                      >
                        <option value="friends_only">Только друзья</option>
                        <option value="public">Публичный (виден всем)</option>
                        <option value="link_only">По ссылке</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                      <Button
                        label="Отмена"
                        type="button"
                        onClick={() => setShowCreatePage(false)}
                        className="p-button-text"
                      />
                      <Button
                        label="Сохранить"
                        type="submit"
                        icon="pi pi-check"
                        className="custom-green-button"
                      />
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <>
                {showItemsPage && selectedWishlist ? (
                  <ItemsDialog
                    wishlist={selectedWishlist}
                    visible={true}
                    onHide={() => {
                      setShowItemsPage(false);
                      setSelectedWishlist(null);
                    }}
                    toast={toast}
                    user={user}
                    onItemsChanged={() => {
                      loadWishlists();
                      loadFriendsWishlists();
                    }}
                  />
                ) : (
                  <>
                    {activeTab !== 'friends' && (
                      <div className="breadcrumbs">
                        <i className="pi pi-home" onClick={() => {
                          setShowItemsPage(false);
                          setSelectedWishlist(null);
                        }}></i>
                        <i className="pi pi-angle-right"></i>
                        <span className="clickable" onClick={() => {
                          setShowItemsPage(false);
                          setSelectedWishlist(null);
                        }}>Моя страница</span>
                      </div>
                    )}
            
                    {activeTab === 'friends' ? (
                      friendWishlist ? (
                <ItemsDialog
                  wishlist={friendWishlist}
                  visible={true}
                  onHide={() => setFriendWishlist(null)}
                  toast={toast}
                  readOnly={true}
                  breadcrumb={selectedFriend?.fullName || selectedFriend?.username}
                />
              ) : selectedFriend ? (
                <FriendProfilePage
                  friend={selectedFriend}
                  toast={toast}
                  onBack={() => setSelectedFriend(null)}
                  onOpenWishlist={setFriendWishlist}
                />
              ) : (
                <>
                  <h2 style={{ fontStyle: 'normal', fontSize: '24.5px', fontWeight: 600, marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                    Друзья
                  </h2>
                  <FriendsPanel toast={toast} user={user} onOpenFriend={setSelectedFriend} />
                </>
              )
                    ) : activeTab === 'profile' ? (
              <>
            <div className="profile-card">
              <div className="profile-card-header" style={{ marginTop: '-24px' }}>
                <div className="profile-avatar-large">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="profile-card-info">
                  <h2>{user.fullName || user.username || 'Пользователь'}</h2>
                  <p className="profile-birthdate">
                    {user.birthDate ? `${new Date().getFullYear() - new Date(user.birthDate).getFullYear()} лет` : ''}
                  </p>
                  <p className="profile-bio">{user.bio || 'Личная информация отсутствует...'}</p>
                </div>
                <div className="profile-actions">
                  <button className="icon-button" onClick={() => setShowEditProfilePage(true)}>
                    <i className="pi pi-pencil"></i>
                  </button>
                  <button className="icon-button">
                    <i className="pi pi-upload"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="wishlists-section">
              <div className="wishlists-header">
               <h3 style={{ marginTop: '-40px' }}>Активные вишлисты:</h3>
                {wishlists.length > 0 && (
                  <Button
                    label="Создать вишлист"
                    icon="pi pi-plus"
                    onClick={() => setShowCreatePage(true)}
                    className="custom-green-button"
                  />
                )}
              </div>
              
              <div className="wishlists-grid">
                {loading ? (
                  <div className="flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                    <ProgressSpinner />
                  </div>
                ) : wishlists.length === 0 ? (
                  <div className="empty-wishlists-container">
                    {/* Звездочки */}
                    <img src="/images/zvezd1.svg" alt="" className="empty-wishlists-star-1" />
                    <img src="/images/zvezd2.svg" alt="" className="empty-wishlists-star-2" />
                    <img src="/images/zvezd3.svg" alt="" className="empty-wishlists-star-3" />
                    <img src="/images/zvezd4.svg" alt="" className="empty-wishlists-star-4" />
                    <img src="/images/zvezd5.svg" alt="" className="empty-wishlists-star-5" />
                    <img src="/images/zvezd6.svg" alt="" className="empty-wishlists-star-6" />
                    <img src="/images/zvezd7.svg" alt="" className="empty-wishlists-star-7" />
                    <img src="/images/zvezd8.svg" alt="" className="empty-wishlists-star-8" />
                    <img src="/images/zvezd9.svg" alt="" className="empty-wishlists-star-9" />
                    
                    {/* Персонаж */}
                    <img src="/images/maskot.svg" alt="Персонаж" className="empty-wishlists-character" />
                    
                    <p className="empty-wishlists-text">
                      Здесь пока пусто. Создайте свой первый список желаний!
                    </p>
                    <Button
                      label="Создать вишлист"
                      icon="pi pi-plus"
                      onClick={() => setShowCreatePage(true)}
                      className="custom-green-button empty-wishlists-button"
                      style={{ fontSize: '16px', padding: '12px 24px' }}
                    />
                  </div>
                ) : (
                  wishlists.map(wishlist => (
                    <div key={wishlist.id} className="wishlist-card" onClick={() => {
                      setSelectedWishlist(wishlist);
                      setShowItemsPage(true);
                    }} style={{ cursor: 'pointer' }}>
                      <div className="wishlist-card-header">
                        <h4>{wishlist.title}</h4>
                        <div style={{ position: 'relative' }}>
                          <button 
                            className="icon-button-small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setWishlistMenuOpen(wishlistMenuOpen === wishlist.id ? null : wishlist.id);
                            }}
                          >
                            <i className="pi pi-ellipsis-v"></i>
                          </button>
                          
                          {wishlistMenuOpen === wishlist.id && (
                            <>
                              <div 
                                className="menu-overlay" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setWishlistMenuOpen(null);
                                }}
                              />
                              <div className="wishlist-menu" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  className="wishlist-menu-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditWishlist(wishlist);
                                  }}
                                >
                                  <i className="pi pi-pencil"></i>
                                  <span>Редактировать</span>
                                </button>
                                <button 
                                  className="wishlist-menu-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShareWishlist(wishlist);
                                  }}
                                >
                                  <i className="pi pi-upload"></i>
                                  <span>Поделиться вишлистом</span>
                                </button>
                                <button 
                                  className="wishlist-menu-item delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteWishlist(wishlist.id);
                                  }}
                                >
                                  <i className="pi pi-trash"></i>
                                  <span>Удалить</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      {wishlist.eventName && (
                        <p className="wishlist-event-name">{wishlist.eventName}</p>
                      )}
                      <div className="wishlist-items-preview">
                        {wishlist.items && wishlist.items.length > 0 && wishlist.items[0].imageUrl ? (
                          <div className="item-preview">
                            <img src={wishlist.items[0].imageUrl} alt={wishlist.items[0].name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                          </div>
                        ) : (
                          <div className="item-preview">
                            <i className="pi pi-gift"></i>
                          </div>
                        )}
                      </div>
                      <div className="wishlist-card-footer">
                        {wishlist.eventDate ? (
                          <span className="wishlist-date">
                            {new Date(wishlist.eventDate).toLocaleDateString('ru-RU')}
                          </span>
                        ) : (
                          <span className="wishlist-status">Бессрочно</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
              </>
            ) : null}
              </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <WishlistDialog
        visible={showCreateDialog}
        onHide={() => setShowCreateDialog(false)}
        onSubmit={handleCreateWishlist}
      />

      <UserProfileDialog profile={authorProfile} onHide={() => setAuthorProfile(null)} />

      <Dialog
        header="Редактировать профиль"
        visible={showProfileDialog}
        style={{ width: '440px' }}
        onHide={() => setShowProfileDialog(false)}
      >
        <div style={{ marginBottom: '20px', padding: '12px', background: '#f9f9f9', borderRadius: '6px' }}>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Аккаунт</div>
          <div style={{ fontWeight: 500 }}>{user?.username}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>{user?.email}</div>
        </div>

        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const payload = {
            fullName: formData.get('fullName') || null,
            bio: formData.get('bio') || null,
            phone: formData.get('phone') || null,
            city: formData.get('city') || null,
            birthDate: formData.get('birthDate') || null,
          };
          try {
            await handleUpdateProfile(payload);
            setShowProfileDialog(false);
          } catch {}
        }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#555' }}>Полное имя</label>
            <input
              name="fullName"
              type="text"
              className="p-inputtext p-component"
              style={{ width: '100%' }}
              defaultValue={user?.fullName || ''}
              placeholder="Иван Иванов"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#555' }}>Дата рождения</label>
            <input
              name="birthDate"
              type="date"
              className="p-inputtext p-component"
              style={{ width: '100%' }}
              defaultValue={user?.birthDate ? user.birthDate.substring(0, 10) : ''}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#555' }}>Город</label>
            <input
              name="city"
              type="text"
              className="p-inputtext p-component"
              style={{ width: '100%' }}
              defaultValue={user?.city || ''}
              placeholder="Москва"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#555' }}>Телефон</label>
            <input
              name="phone"
              type="tel"
              className="p-inputtext p-component"
              style={{ width: '100%' }}
              defaultValue={user?.phone || ''}
              placeholder="+7 900 000 00 00"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#555' }}>О себе</label>
            <textarea
              name="bio"
              className="p-inputtextarea p-inputtext p-component"
              style={{ width: '100%', minHeight: '80px' }}
              defaultValue={user?.bio || ''}
              placeholder="Расскажите о себе..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <Button
              label="Отмена"
              type="button"
              className="p-button-text"
              onClick={() => setShowProfileDialog(false)}
            />
            <Button
              label="Сохранить"
              type="submit"
            />
          </div>
        </form>
      </Dialog>
        </div>
      </div>
    </>
  );
}

export default App;