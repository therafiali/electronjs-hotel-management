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
  Assessment as ActivityIcon
} from '@mui/icons-material';

interface DashboardProps {
  onNavigateToDashboard: () => void;
  onNavigateToInvoice: () => void;
  onNavigateToList: () => void;
  onNavigateToItems: () => void;
  onNavigateToRooms: () => void;
  onNavigateToActivityLogs: () => void;
}

const drawerWidth = 280;

const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToDashboard,
  onNavigateToInvoice,
  onNavigateToList,
  onNavigateToItems,
  onNavigateToRooms,
  onNavigateToActivityLogs,
}) => {
  const [selectedItem, setSelectedItem] = useState('dashboard');

  const menuItems = [
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
    },
    {
      text: 'Activity Logs',
      icon: <ActivityIcon />,
      id: 'activity',
      action: onNavigateToActivityLogs
    }
  ];



    return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1a1d29',
          color: 'white',
          border: 'none'
        },
      }}
    >
      {/* Logo Section */}
      <Box sx={{ p: 3, borderBottom: '1px solid #2d3748' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#6366f1' }}>
          🏨 Hotel Paradise
        </Typography>
        <Typography variant="body2" sx={{ color: '#a0aec0', mt: 0.5 }}>
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
                color: selectedItem === item.id ? '#6366f1' : '#a0aec0',
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
    </Drawer>
  );
};

export default Dashboard;
