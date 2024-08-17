/*"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Input, Label, Button } from '@shadcn/ui';

// Define the interface for the props
interface LoginFormProps {
  sleeperUsername: string;
  fetchSleeper: (username: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ sleeperUsername, fetchSleeper }) => {
  const [username, setUsername] = useState<string>(sleeperUsername);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchSleeper(username);
  };

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="username">Sleeper Username</Label>
          <Input
            type="text"
            id="username"
            value={username}
            onChange={handleInputChange}
            required
            placeholder="Enter your Sleeper username"
          />
        </div>
        <Button type="submit">Login</Button>
      </form>
    </div>
  );
};

export default LoginForm;*/