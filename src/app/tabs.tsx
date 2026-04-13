import { SidebarTabItem } from '@/components/Sidebar';
import productsIcon from '@/icons/products.svg';
import settingsIcon from '@/icons/settings.svg';

const tabs: SidebarTabItem[] = [
  {
    id: 'products',
    label: 'Products',
    icon: <span data-testid="products-icon">P</span>,
    tooltip: 'Manage products',
    tabId: 'products-tab',
    panelId: 'products-panel'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <span data-testid="settings-icon">S</span>,
    tabId: 'settings-tab',
    panelId: 'settings-panel'
  }
];

export default tabs;
