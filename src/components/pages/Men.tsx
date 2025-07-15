import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { supabase } from "../../../supabaseClient";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  location: string;
}

function Men() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [userList, setUserList] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    readUsers();
  }, []);

  const readUsers = async () => {
    const { data, error } = await supabase.from("SupaCRUD").select("*");
    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUserList(data as User[]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const userData = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      location,
    };

    const { data: existingUsers, error: fetchError } = await supabase
      .from("SupaCRUD")
      .select("*")
      .or(`email.eq.${email},phone.eq.${phone}`);

    if (fetchError) {
      console.error("Error checking duplicates:", fetchError);
      return;
    }

    const isDuplicate = (existingUsers as User[]).some((user) => {
      if (editingId) {
        return (
          user.id !== editingId &&
          (user.email === email || user.phone === phone)
        );
      }
      return user.email === email || user.phone === phone;
    });

    if (isDuplicate) {
      alert("A user with this email or phone already exists.");
      return;
    }

    if (editingId !== null) {
      const { data, error } = await supabase
        .from("SupaCRUD")
        .update(userData)
        .eq("id", editingId);

      if (error) {
        console.error("Update Error:", error);
      } else {
        console.log("User updated:", data);
        setEditingId(null);
        readUsers();
      }
    } else {
      const { data, error } = await supabase
        .from("SupaCRUD")
        .insert([userData]);

      if (error) {
        console.error("Insert Error:", error);
      } else {
        console.log("User added:", data);
        readUsers();
      }
    }

    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setLocation("");
  };

  const editUser = (user: User) => {
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setEmail(user.email);
    setPhone(user.phone);
    setLocation(user.location);
    setEditingId(user.id);
  };

  const deleteUser = async (id: number) => {
    const { data, error } = await supabase
      .from("SupaCRUD")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete Error:", error);
    } else {
      console.log("User deleted:", data);
      setUserList((prev) => prev.filter((user) => user.id !== id));
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFirstName(e.target.value)
          }
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setLastName(e.target.value)
          }
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
        />
        <input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPhone(e.target.value)
          }
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setLocation(e.target.value)
          }
        />
        <button type="submit">{editingId ? "Update" : "Submit"}</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFirstName("");
              setLastName("");
              setEmail("");
              setPhone("");
              setLocation("");
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <ul>
        {userList.map((user) => (
          <li className="flex gap-10" key={user.id}>
            <p>{user.first_name}</p>
            <p>{user.last_name}</p>
            <p>{user.email}</p>
            <p>{user.phone}</p>
            <p>{user.location}</p>
            <button onClick={() => editUser(user)}>Edit</button>
            <button onClick={() => deleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </>
  );
}

export default Men;
