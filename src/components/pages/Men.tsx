import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { supabase } from "../../../supabaseClient";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  created_at?: string;
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

    let lat: number | null = null;
    let lon: number | null = null;
    let formattedAddress: string = location.trim();

    try {
      const res = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(location.trim())}`
      );
      const data = await res.json();

      if (!res.ok || !data || !data[0]?.latlng) {
        alert("Could not find country coordinates. Please try a valid country name.");
        return;
      }

      [lat, lon] = data[0].latlng;
      formattedAddress = data[0].name.common;
    } catch (error) {
      console.error("Error fetching country data:", error);
      alert("Error fetching coordinates. Please try again later.");
      return;
    }

    if (lat === null || lon === null) {
      alert("Geocoding failed to provide valid coordinates.");
      return;
    }

    const userData = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      location: formattedAddress,
      latitude: lat,
      longitude: lon,
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
        .insert([userData])
        .select();

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
      <form onSubmit={handleSubmit} className="flex gap-3 flex-wrap">
        <input
          className="border-2 border-gray-500"
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFirstName(e.target.value)
          }
          required
        />
        <input
          className="border-2 border-gray-500"
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setLastName(e.target.value)
          }
          required
        />
        <input
          className="border-2 border-gray-500"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          required
        />
        <input
          className="border-2 border-gray-500"
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPhone(e.target.value)
          }
          required
        />
        <input
          className="border-2 border-gray-500"
          type="text"
          placeholder="Country"
          value={location}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setLocation(e.target.value)
          }
          required
        />
        <button className="border-2 px-3 bg-blue-200" type="submit">
          {editingId ? "Update" : "Submit"}
        </button>
        {editingId && (
          <button
            type="button"
            className="border-2 px-3 bg-gray-300"
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

      <table className="mt-4 border border-collapse border-gray-400 w-full text-sm">
        <thead>
          <tr>
            <th className="border p-2">First Name</th>
            <th className="border p-2">Last Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Country</th>
            <th className="border p-2">Latitude</th>
            <th className="border p-2">Longitude</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {userList.map((user) => (
            <tr key={user.id}>
              <td className="border p-2">{user.first_name}</td>
              <td className="border p-2">{user.last_name}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.phone}</td>
              <td className="border p-2">{user.location}</td>
              <td className="border p-2">{user.latitude}</td>
              <td className="border p-2">{user.longitude}</td>
              <td className="border p-2 flex gap-2">
                <button
                  className="border-2 bg-green-500 px-2 text-white"
                  onClick={() => editUser(user)}
                >
                  Edit
                </button>
                <button
                  className="border-2 bg-red-500 px-2 text-white"
                  onClick={() => deleteUser(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Men;
