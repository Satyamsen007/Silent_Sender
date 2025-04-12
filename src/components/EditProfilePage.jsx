'use client'

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { toast } from "sonner"
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from "react-hook-form";
import { useDebounceCallback } from "usehooks-ts";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { AlertTriangle, Eye, EyeOff, Loader2, PencilIcon, X } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";
import 'react-image-crop/dist/ReactCrop.css'
import { centerCrop, convertToPixelCrop, makeAspectCrop, ReactCrop } from 'react-image-crop'
import { updateUserProfileSchemaValidation } from "@/schemas/updateUserProfileSchema";

const EditProfilePage = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newAvatar, setNewAvatar] = useState('');
  const [changeProfileWindow, setChangeProfileWindow] = useState(false);
  const [userName, setUserName] = useState('');
  const [userNameMessage, setUserNameMessage] = useState('');
  const [isCheckingUserName, setIsCheckingUserName] = useState(false);
  const debounced = useDebounceCallback(setUserName, 300);
  const { data: session, status, update } = useSession();
  const [loadAvatar, setLoadAvatar] = useState(true)
  const router = useRouter();
  const [imgSrc, setImageSrc] = useState('')
  const [crop, setCrop] = useState();
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showPasswordEyeIcons, setShowPasswordEyeIcons] = useState(false)
  const [showConfirmPasswordEyeIcons, setShowConfirmPasswordEyeIcons] = useState(false)
  const [cropImageError, setCropImageError] = useState('')
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const ASPECT_RATIO = 1;
  const MIN_DIMENSION = 150;
  const MAX_SIZE_MB = 1;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  const form = useForm({
    resolver: zodResolver(updateUserProfileSchemaValidation),
    defaultValues: {
      username: '',
      newPassword: '',
      confirmPassword: ''
    }
  });
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleAccountDeactivation = async () => {
    setIsDeactivating(true);
    try {
      const response = await axios.delete('/api/deactivate-account');
      toast.success(response.data.message);
      router.refresh();
      router.replace('/sign-in');
    } catch (error) {
      toast.error(error.response?.data.message || 'Error deactivating account');
    } finally {
      setIsDeactivating(false);
      setShowDeactivateConfirm(false);
    }
  };

  const handleSubmit = async (data) => {
    setIsUpdating(true);
    try {
      const formData = {
        username: data.username,
        newPassword: data.confirmPassword,
        avatar: newAvatar
      }
      const response = await axios.put('/api/update-user', formData);

      if (response.status === 200) {
        await update({
          ...session,
          user: {
            ...session?.user,
            userName: response.data.user.userName,
            image: response.data.user.avatar,
            avatar: response.data.user.avatar,
            email: response.data.user.email
          }
        })
        toast.success(response?.data.message);
        router.replace('/dashboard')
        router.refresh();
      }
    } catch (error) {
      console.log('Error while Updating User', error);
      toast.error(error.response?.data.message);
    } finally {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    const checkUserNameUnique = async () => {
      if (userName) {
        setIsCheckingUserName(true);
        setUserNameMessage('');
        try {
          const response = await axios.get(`/api/check-username-unique?userName=${userName}`);
          setUserNameMessage(response.data.message)
        } catch (error) {
          setUserNameMessage(error.response?.data.message ?? 'Error while checking user name');
        } finally {
          setIsCheckingUserName(false);
        }
      }
    }
    checkUserNameUnique();
  }, [userName]);

  useEffect(() => {
    if (status !== 'loading') {
      setLoadAvatar(false)
    }
  }, [session])

  const onSelectFile = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > MAX_SIZE_BYTES) {
      setCropImageError(`File size too large. Maximum allowed size is 1 MB.`);
      return setImageSrc('');
    }

    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      const imageElement = new window.Image();
      const imageUrl = fileReader.result?.toString() || '';
      imageElement.src = imageUrl;

      imageElement.addEventListener('load', (event) => {
        const img = event.currentTarget;
        if (img.naturalWidth < MIN_DIMENSION || img.naturalHeight < MIN_DIMENSION) {
          setCropImageError('Image must be at least 150x150 pixels.');
          return setImageSrc('');
        }
      });

      setImageSrc(imageUrl);
    });

    fileReader.readAsDataURL(file);
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const cropWidthPercent = (MIN_DIMENSION / width) * 100;

    if (!width || !height) return;
    const crop = makeAspectCrop(
      {
        unit: '%',
        width: cropWidthPercent,
      },
      ASPECT_RATIO,
      width,
      height
    );

    const centeredCrop = centerCrop(crop, width, height);
    const pixelCrop = convertToPixelCrop(centeredCrop, width, height);
    setCrop(pixelCrop);
  };

  const setCanvasPreview = (image, canvas, crop) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context')
    }
    const pixelRatio = window.devicePixelRatio;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio)

    ctx.scale(pixelRatio, pixelRatio)
    ctx.imageSmoothingQuality = 'high';
    ctx.save();

    const cropX = crop.x * scaleX
    const cropY = crop.y * scaleY

    ctx.translate(-cropX, -cropY);
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
    );
    ctx.restore();
  }

  return (
    <div className="relative">
      {isUpdating && (
        <div className="w-full h-screen top-0 bg-white absolute opacity-60 z-50 flex justify-center items-center">
          <Loader2 className="w-10 h-10 animate-spin text-gray-900" />
        </div>
      )}
      <div className="max-w-5xl relative mx-auto p-6">
        <AnimatePresence>
          {changeProfileWindow && (
            <motion.div
              initial={{ opacity: 0, }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-[80vh] z-50 bg-gray-900 absolute p-5 rounded-xl">
              <div className="flex justify-between">
                <div>
                  <input
                    type="file"
                    id="fileUpload"
                    accept="image/*"
                    className="hidden"
                    onChange={onSelectFile}
                  />

                  <label
                    htmlFor="fileUpload"
                    className="cursor-pointer border hover:border-dashed transition-all duration-300 px-4 py-2 text-white rounded-md bg-gray-800"
                  >
                    Upload File
                  </label>
                </div>
                <div onClick={() => setChangeProfileWindow(false)}>
                  <X className="w-5 h-5 text-white cursor-pointer" />
                </div>
              </div>
              {(cropImageError && !imgSrc) && <p className="text-red-500 my-6 text-xs">{cropImageError}</p>}
              {imgSrc && (
                <div className="flex flex-col items-center">
                  <ReactCrop
                    crop={crop}
                    circularCrop
                    keepSelection
                    onChange={
                      (pixelCrop, percentCrop) => {
                        if (imgRef.current) {
                          setCrop(percentCrop);
                        }
                      }
                    }
                    aspect={ASPECT_RATIO}
                    minHeight={MIN_DIMENSION}
                  >
                    <img src={imgSrc} ref={imgRef} alt="" style={{ maxHeight: '60vh' }} onLoad={onImageLoad} />
                  </ReactCrop>
                  <div className="mt-8" onClick={() => {
                    if (!imgRef.current || !previewCanvasRef.current || !crop) {
                      console.error("Image, Canvas, or Crop is not available");
                      return;
                    }
                    setCanvasPreview(
                      imgRef.current,
                      previewCanvasRef.current,
                      convertToPixelCrop(
                        crop,
                        imgRef.current.width,
                        imgRef.current.height
                      )
                    )
                    const profileUrl = previewCanvasRef.current.toDataURL() || ''
                    console.log(profileUrl);

                    setNewAvatar(profileUrl)
                    setChangeProfileWindow(false)
                    setImageSrc('')
                  }}>
                    <Button className="cursor-pointer px-4 py-2 text-white rounded-md bg-gray-800 hover:bg-gray-800 border hover:border-dashed transition-all duration-200">Save your profile image</Button>
                  </div>
                </div>
              )}
              {
                crop && (
                  <canvas hidden className="mt-4" ref={previewCanvasRef} style={{ border: "1px solid black", objectFit: 'contain', width: 150, height: 150 }} />
                )
              }
            </motion.div>
          )
          }
        </AnimatePresence>
        {/* Header Section */}
        <motion.h1
          className="text-3xl font-bold text-center text-purple-700 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Update Your Profile
        </motion.h1>
        <p className="text-center text-gray-500 mb-10">
          Keep your identity safe and personalize your profile. Your anonymity is our priority!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
          {/* Profile Card */}
          <motion.div
            className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6 border border-gray-200"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="relative w-[150px] h-[150px] rounded-full border-4 border-purple-600 overflow-hidden flex items-center justify-center select-none bg-purple-100">
                {loadAvatar ? (
                  <Skeleton className="absolute inset-0 rounded-full bg-purple-800" />
                ) : newAvatar || session?.user?.avatar ? (
                  <Image
                    src={newAvatar || session?.user?.avatar}
                    alt={`${session?.user?.userName || 'User'} avatar`}
                    width={150}
                    height={150}
                    className="object-cover w-full h-full"
                    priority={true}
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-4xl font-bold text-purple-800">
                    {session?.user?.userName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div onClick={() => setChangeProfileWindow(true)} className="absolute -bottom-2 right-[35%] bg-purple-600 p-2 rounded-full shadow-md cursor-pointer">
                <PencilIcon className="h-4 w-4 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mt-4">{session?.user?.name || "Anonymous User"}</h2>
            <p className="text-gray-500 text-sm">{session?.user?.email || "user@example.com"}</p>
            <p className="text-gray-400 text-sm italic mt-2">
              "Stay anonymous, express freely."
            </p>
          </motion.div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="my-5">
                    <FormLabel className="ml-2">New Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter new username" {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          debounced(e.target.value)
                        }}
                      />
                    </FormControl>
                    {isCheckingUserName && <Loader2 className="animate-spin" />}
                    <p className={`text-sm ${userNameMessage == 'UserName is unique' ? 'text-green-500' : 'text-red-500'}`}>{userNameMessage}</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="newPassword"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="my-5">
                    <FormLabel className="ml-2">New Password</FormLabel>
                    <FormControl>
                      <div className="flex items-center relative">
                        <Input type={showNewPassword ? 'text' : 'password'} placeholder="Enter new password"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            setShowPasswordEyeIcons(e.target.value.length > 0);
                          }}
                          className="pr-10" />
                        {showPasswordEyeIcons && (
                          showNewPassword ? (
                            <EyeOff className="absolute right-2 w-5 h-5 cursor-pointer" onClick={() => setShowNewPassword(false)} />
                          ) : (
                            <Eye className="absolute right-2 w-5 h-5 cursor-pointer" onClick={() => setShowNewPassword(true)} />
                          )
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="confirmPassword"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="my-5">
                    <FormLabel className="ml-2">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="flex items-center relative">
                        <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="Re-enter password"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            setShowConfirmPasswordEyeIcons(e.target.value.length > 0);
                          }}
                          className="pr-10" />
                        {showConfirmPasswordEyeIcons && (
                          showConfirmPassword ? (
                            <EyeOff className="absolute right-2 w-5 h-5 cursor-pointer" onClick={() => setShowConfirmPassword(false)} />
                          ) : (
                            <Eye className="absolute right-2 w-5 h-5 cursor-pointer" onClick={() => setShowConfirmPassword(true)} />
                          )
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isUpdating} className="cursor-pointer">
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait
                  </>
                ) : (
                  'Update'
                )}
              </Button>
              <p className="text-sm text-center text-gray-500 mt-4">
                Your profile details are private and secure. We never share your data.
              </p>
            </form>
          </Form>
        </div>
        <motion.div
          className="mt-6 bg-white shadow-lg rounded-xl p-6 border border-red-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-red-600">Danger Zone</h3>
              <p className="text-gray-600 mt-1">
                Deactivating your account will permanently delete all your data and cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              className="mt-4 md:mt-0 cursor-pointer"
              onClick={() => setShowDeactivateConfirm(true)}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Deactivate Account
            </Button>
          </div>
          {/* Deactivation Confirmation Modal */}
          <AnimatePresence>
            {showDeactivateConfirm && (
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-xl p-6 max-w-md w-full"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                      <h3 className="text-xl font-bold text-red-600">Confirm Deactivation</h3>
                    </div>
                    <button onClick={() => setShowDeactivateConfirm(false)}>
                      <X className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                    </button>
                  </div>

                  <p className="text-gray-600 mb-6">
                    Are you sure you want to deactivate your account? This will:
                  </p>

                  <ul className="list-disc pl-5 mb-6 space-y-2 text-gray-600">
                    <li>Permanently delete all your messages</li>
                    <li>Remove your profile information</li>
                    <li>Disable your ability to receive anonymous messages</li>
                  </ul>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 cursor-pointer"
                      onClick={() => setShowDeactivateConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 cursor-pointer"
                      onClick={handleAccountDeactivation}
                      disabled={isDeactivating}
                    >
                      {isDeactivating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 mr-2" />
                      )}
                      {isDeactivating ? 'Deactivating...' : 'Confirm Deactivation'}
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default EditProfilePage