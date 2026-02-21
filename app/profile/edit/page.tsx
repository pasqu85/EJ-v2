"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconCamera,
  IconPhoto,
  IconUser,
} from "@tabler/icons-react";

import {
  ActionIcon,
  Box,
  Container,
  Title,
  Text,
  Avatar,
  Paper,
  Stack,
  TextInput,
  PasswordInput,
  Button,
  Portal,
  Group,
} from "@mantine/core";

import { supabase } from "@/app/lib/supabaseClient";

export default function EditProfilePage() {
  const router = useRouter();

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [pickerOpen, setPickerOpen] = useState(false);

  const [avatar, setAvatar] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // -------------------------
  // LOAD PROFILE FROM SUPABASE
  // -------------------------
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setEmail(user.email ?? "");

      const { data } = await supabase
        .from("profiles")
        .select("name, surname, phone, avatar_url")
        .eq("id", user.id)
        .single();

      if (!data) return;

      setFirstName(data.name ?? "");
      setLastName(data.surname ?? "");
      setPhone(data.phone ?? "");
      setAvatar(data.avatar_url ?? null);
    }

    loadProfile();
  }, []);

  // -------------------------
  // AVATAR UPLOAD
  // -------------------------
  async function uploadAvatar(file: File) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const filePath = `${user.id}/avatar.jpg`; // ✅ IMPORTANTISSIMO

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error(error);
      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    setAvatar(publicUrl);
  }

  const onPickAvatar = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadAvatar(file);
    setPickerOpen(false);
  };

  // -------------------------
  // SAVE PROFILE
  // -------------------------
  const onSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (!firstName.trim()) {
      alert("Inserisci il nome");
      return;
    }

    // update profilo DB
    const { error } = await supabase
      .from("profiles")
      .update({
        name: firstName.trim(),
        surname: lastName.trim(),
        phone: phone.trim(),
      })
      .eq("id", user.id);

    if (error) {
      alert(error.message);
      return;
    }

    // aggiorna password se inserita
    if (password.trim()) {
      await supabase.auth.updateUser({
        password,
      });
    }

    alert("Profilo aggiornato ✅");
    router.replace("/profile");
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <Box style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* TOP BAR */}
      <Box
        bg="white"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Container size="sm" h={60}>
          <Box className="flex items-center justify-between h-full">
            <ActionIcon
              variant="subtle"
              onClick={() => router.back()}
              radius="xl"
              size="lg"
            >
              <IconArrowLeft size={22} />
            </ActionIcon>

            <Text fw={800}>Modifica Profilo</Text>

            <Box w={40} />
          </Box>
        </Container>
      </Box>

      <Container size="sm" pt={30}>
        {/* AVATAR */}
        <Box mb={40} className="flex flex-col items-center">
          <Box style={{ position: "relative" }}>
            <Avatar
              src={avatar}
              size={120}
              radius={100}
              style={{ border: "4px solid white" }}
            >
              <IconUser size={50} />
            </Avatar>

            <ActionIcon
              onClick={() => setPickerOpen(true)}
              size={42}
              radius="xl"
              variant="filled"
              style={{
                position: "absolute",
                bottom: 2,
                right: 2,
                backgroundColor: "#10b981",
              }}
            >
              <IconCamera size={20} />
            </ActionIcon>
          </Box>

          <Title order={2} mt="md">
            {firstName} {lastName}
          </Title>
        </Box>

        {/* FORM */}
        <Paper radius="xl" p="xl">
          <Stack>
            <Group grow>
              <TextInput
                label="Nome"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextInput
                label="Cognome"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Group>

            <TextInput label="Email" value={email} disabled />

            <PasswordInput
              label="Nuova password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <TextInput
              label="Telefono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Stack>
        </Paper>

        <Button
          fullWidth
          radius="xl"
          size="lg"
          mt={30}
          onClick={onSave}
          variant="gradient"
          gradient={{ from: "#047857", to: "#10b981" }}
        >
          AGGIORNA PROFILO
        </Button>
      </Container>

      {/* AVATAR PICKER */}
{pickerOpen && (
  <Portal>
    <Box
      onClick={() => setPickerOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999, // ✅ IMPORTANTISSIMO
        backgroundColor: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(6px)",
      }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          bottom: 20,
          left: 15,
          right: 15,
          zIndex: 10000, // ✅
          backgroundColor: "white",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}
      >
        <Box p="lg" style={{ textAlign: "center", borderBottom: "1px solid #f1f5f9" }}>
          <Text fw={800}>Scegli una foto</Text>
        </Box>

        <Stack gap={0}>
          <Button
            variant="subtle"
            color="gray"
            fullWidth
            h={60}
            radius={0}
            leftSection={<IconCamera size={22} color="#10b981" />}
            onClick={() => cameraRef.current?.click()}
          >
            Scatta una foto
          </Button>

          <Button
            variant="subtle"
            color="gray"
            fullWidth
            h={60}
            radius={0}
            leftSection={<IconPhoto size={22} color="#3b82f6" />}
            onClick={() => galleryRef.current?.click()}
          >
            Scegli dalla galleria
          </Button>
        </Stack>
      </Box>
    </Box>
  </Portal>
)}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="user"
        hidden
        onChange={onPickAvatar}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onPickAvatar}
      />
    </Box>
  );
}