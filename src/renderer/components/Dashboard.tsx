import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Receipt as InvoiceIcon,
  History as HistoryIcon,
  Inventory as ItemsIcon,
  Hotel as RoomIcon,
  Assessment as ActivityIcon,
  Analytics as ReportsIcon
} from '@mui/icons-material';

interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "staff" | "manager";
  name: string;
  isActive: boolean;
  createdDate: string;
}

interface DashboardProps {
  onNavigateToDashboard: () => void;
  onNavigateToInvoice: () => void;
  onNavigateToList: () => void;
  onNavigateToItems: () => void;
  onNavigateToRooms: () => void;
  onNavigateToActivityLogs: () => void;
  onNavigateToReports: () => void;
  onLogout: () => void;
  currentUser: User;
}

const drawerWidth = 320;

const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToDashboard,
  onNavigateToInvoice,
  onNavigateToList,
  onNavigateToItems,
  onNavigateToRooms,
  onNavigateToActivityLogs,
  onNavigateToReports,
  onLogout,
  currentUser,
}) => {
  const [selectedItem, setSelectedItem] = useState('dashboard');

  // Base menu items available to all users
  const baseMenuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      id: 'dashboard',
      action: onNavigateToDashboard
    },
    {
      text: 'Create Invoice',
      icon: <InvoiceIcon />,
      id: 'invoice',
      action: onNavigateToInvoice
    },
    {
      text: 'Invoice History',
      icon: <HistoryIcon />,
      id: 'history',
      action: onNavigateToList
    },
    {
      text: 'Items Management',
      icon: <ItemsIcon />,
      id: 'items',
      action: onNavigateToItems
    },
    {
      text: 'Room Management',
      icon: <RoomIcon />,
      id: 'rooms',
      action: onNavigateToRooms
    }
  ];

  // Admin-only menu items
  const adminMenuItems = [
    {
      text: 'Activity Logs',
      icon: <ActivityIcon />,
      id: 'activity',
      action: onNavigateToActivityLogs
    },
    {
      text: 'Revenue Reports',
      icon: <ReportsIcon />,
      id: 'reports',
      action: onNavigateToReports
    }
  ];

  // Combine menu items based on user role
  const menuItems = currentUser.role === 'admin' 
    ? [...baseMenuItems, ...adminMenuItems]
    : baseMenuItems;



    return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          color: '#333333',
          border: '1px solid #e2e8f0',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)'
        },
      }}
    >
      {/* Logo Section */}
      <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#6366f1' }}>
         Rama Resort
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
          Management System
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={selectedItem === item.id}
              onClick={() => {
                setSelectedItem(item.id);
                item.action();
              }}
              sx={{
                mx: 2,
                borderRadius: 2,
                color: selectedItem === item.id ? '#6366f1' : '#64748b',
                backgroundColor: selectedItem === item.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.05)',
                  color: '#6366f1'
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: '#6366f1',
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: 'inherit',
                minWidth: 40,
                '& .MuiSvgIcon-root': {
                  fontSize: '1.2rem'
                }
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: selectedItem === item.id ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Logout Button - Bottom of Sidebar */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        p: 2,
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc'
      }}>
        <ListItemButton
          onClick={onLogout}
          sx={{
            borderRadius: 2,
            color: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#dc2626'
            }
          }}
        >
          <ListItemIcon sx={{ 
            color: 'inherit',
            minWidth: 40,
            '& .MuiSvgIcon-root': {
              fontSize: '1.2rem'
            }
          }}>
            🚪
          </ListItemIcon>
          <ListItemText 
            primary="Logout"
            primaryTypographyProps={{
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          />
        </ListItemButton>
      </Box>
    </Drawer>
  );
};

export default Dashboard;
