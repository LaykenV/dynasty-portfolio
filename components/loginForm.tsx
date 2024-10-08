"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation';



const formSchema = z.object({
  username: z.string().min(2).max(15),
});



const LoginForm: React.FC = () => {

  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values.username);
    router.push(`/dashboard/${values.username}`);
  };

  return (
    <Form {...form} >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-2xl text-center'>Enter Your Sleeper Username</FormLabel>
                <FormControl>
                  <Input {...field}  className='w-full p-4'/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit' className='w-full mt-4'>Fetch Your Data</Button>
      </form>
    </Form>
  );
};

export default LoginForm;