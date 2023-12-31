import { Box,Menu, Text, Button, Tooltip, MenuButton, Avatar, MenuList, MenuItem, MenuDivider, Drawer, useDisclosure, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, useToast, Spinner } from '@chakra-ui/react';
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import Perfil from "./Perfil";
import React, { useState } from 'react'
import { useHistory } from "react-router-dom";
import axios from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UsuárioAvatar/UserListItem';
import { getSender } from "../../config/ChatLogics";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";

const SideDrawer = () => {
    const [search, setSearch] = useState("")
    const [searchResult, setSearchResult] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingChat, setLoadingChat] = useState();

    const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
    const history = useHistory();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const logout = () => {
        localStorage.removeItem("userInfo");
        setChats([]);
        history.push("/");
      };

      const toast = useToast();
      
const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Por favor, digite algo na pesquisa",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
     console.log(userId);

    try {
      setLoadingChat(true);

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao buscar o chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
    return ( 
        <>
            <Box display="flex" 
            justifyContent="space-between" 
            alignContent="center" 
            bg="white" 
            w="100%" 
            p="5px 10px 5px 10px"
            borderWidth="5px">

                <Tooltip label="Pesquisar..." hasArrow placement="bottom-end">
                    <Button variant="ghost" onClick={onOpen}>
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <Text display={{base:"none", md: "flex"}} px='4'> 
                             Procurar Usuário
                        </Text> 
                    </Button>
                </Tooltip>

                <Text fontSize="2xl" fontFamily="Work sans">
                    EasyTalk
                </Text>
                <div>
                    <Menu>
                        <MenuButton p={1}>
                          <NotificationBadge
                            count={notification.length}
                            effect={Effect.SCALE}
                          />
                            <BellIcon fontSize="2xl" m={1}/>
                        </MenuButton>
                        <MenuList pl={2}>
                         {!notification.length && "Sem mensagens novas"}
                         {notification.map((notif) => (
                          <MenuItem
                            key={notif._id}
                            onClick={() => {
                              setSelectedChat(notif.chat);
                              setNotification(notification.filter((n) => n !== notif));
                            }}
                          >
                            {notif.chat.isGroupChat
                              ? `Nova mensagem em ${notif.chat.chatName}`
                              : `Nova mensagem de ${getSender(user, notif.chat.users)}`}
                          </MenuItem>
                        ))}
                        </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon/>}>
                            <Avatar 
                                size="sm" 
                                cursor="pointer" 
                                name={user.name} 
                                src={user.pic}
                            />
                        </MenuButton>
                        <MenuList> 
                            <Perfil user={user}>
                                <MenuItem> Meu perfil </MenuItem>
                            </Perfil>
                            <MenuDivider/>
                            <MenuItem onClick={logout}> Logout </MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>
            <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth={"1px"}>Procurar Usuário</DrawerHeader>
                    <DrawerBody>
                        <Box display={"flex"} pb={2}>
                            <Input 
                                placeholder="nome ou email"
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}/>
                            <Button onClick={handleSearch}>Ir</Button>
                        </Box>
                        {loading ? <ChatLoading /> : 
                        (
                            searchResult?.map((user) => (
                                <UserListItem key={user._id} 
                                userData={user} 
                                handleFunction={() => accessChat(user._id)}/>
                            ))
                        )}
                        {loadingChat && <Spinner ml={"auto"} display={"flex"}/>}
                    </DrawerBody> 
                </DrawerContent>
            </Drawer>
        </>

    );
};

export default SideDrawer;
