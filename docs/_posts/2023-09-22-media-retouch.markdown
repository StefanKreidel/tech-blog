---
layout: post
title:  'Set Filesystem Creation Date to when Photo or Video was taken (Mac and Linux)'
description: 'When importing or transcoding photos or videos, the new files` creation date is usually not the date when they were taken. This messes up some program`s file sorting. So let`s fix it.'
date:   2023-09-29 20:10:00 +0100
author: stefan
image:  'https://i.imgur.com/gladidy.jpg'
featured: false
tags:   [Media, EXIF, Bash]
tags_color: '#9485a2'
---

Importing photos or videos from your camera or phone, exporting them from a program like Apple's Photo Library or transcoding them in a tool like HandBrake has one thing in common: the file's **creation date is no longer the date the photo or video was taken**. On the one hand this makes sense. The creation date reflects when the file was created aka first appeared on you computers drive. But this bears one problem: in the case of photos or videos, the creation date should semantically reflect the date and time the original file was taken, not when the generic .JPG file was first created on your computer.

Experts already came to the same conclusion almost 30 years ago which led to the birth of the [EXIF](https://en.wikipedia.org/wiki/Exif) metadata format. It is a semantic metadata format which (amongst many other things) holds information about the camera model and settings but also about the date and location a photo or video was taken.

## 1. What even is Metadata

According to [Wikipedia](https://en.wikipedia.org/wiki/Metadata), metadata

> is data that provides information about other data, but [is] not the content of the data itself.

As already described in my previous post about [copying EXIF metadata from original to transcoded files]({{ site.baseurl }}{% post_url 2023-09-22-media-exif-copy %}), this means that it enriches the actual data with meta information about its' content. This can be anything from a files name, size and creation date all the way to GPS coordinates of a photo, color profile of a video or compression rate of a ZIP file.

In the case of EXIF, this **other data** refers to the abstract idea of a photo or video and not the `.JPG` or `.MOV` computer file. This of course means that the `CreationDate` refers to the date the photo was taken or the `-location` tag holds information on where a video was taken.

But this begs the question: if there are two creation dates, one representing the photo or video and the other the file on your computer, which one should programs use to sort your library? The answer is: **it is a mess!**

## 2. Programs using the *wrong* Creation Date

Let's take a look at a random file on my computer:

```bash
ls -lah IMG_1.MOV
> -rw-------@ 1  user group  177M  28 Sep 2022  IMG_1.MOV
```

The file was created on September 28th. Now let's compare this with the EXIF creation date using [ExifTool](https://exiftool.org):

```bash
exiftool -time:CreationDate -d '%Y-%m-%d %H:%M:%S' IMG_1.MOV
> Create Date: 2022-09-03 06:59:43
```

Both these dates are correct. September 3rd is when the video was taken but the 28th is when it was imported to my computer. The problem with both being correct is that it is now up to the individual program to use the *correct* date depending on the situation.

Apple's Finder for example sorts by the EXIF `CreationDate` because it is the Apple way to always assume what the user wants. Strictly speaking, Finder should sort by the filesystem's creation date as Finder is a **file** explorer. However, in most cases sorting by when the photos were taken is what the user finds more useful.

[DaVinci Resolve](https://www.blackmagicdesign.com/products/davinciresolve) on the other hand sorts by the filesystem's creation date which in my opinion is wrong. As it is a tool for editing videos, you need the files sorted by the time they were taken.

## 3. Re-Touch the File

The solution to this is much simpler than you might assume. All we have to to is to change the file's filesystem creation date via a shell command:

```bash
# macOS
touch -d "$(exiftool -s -s -s -time:CreationDate -d '%Y-%m-%d %H:%M:%S' IMG_1.MOV)" IMG_1.MOV

# Linux
touch -t "$(exiftool -s -s -s -time:CreationDate -d '%Y%m%d%H%M.%S' IMG_1.MOV)" IMG_1.MOV
```

Again, we are using `ExifTool` to extract the *original* creation date of the `IMG_1.MOV` video and then updating the file's creation date on disk with the `touch` command. The latter unfortunately differs between macOS and Linux, so be careful here.

But doing so for hundreds of files is very tedious, so lets **batch process** that. If you are on Mac or Linux, then the following instructions are for you.

# 4. Meet the Script

1. As mentioned before, `ExifTool` is a prerequisite for this script to work. So go ahead and follow their [install instructions](https://exiftool.org/install.html).
2. Clone the git repository to my [bash script collection](https://github.com/StefanKreidel/bash-magic/tree/main) or download just the [retouch.sh script](https://github.com/StefanKreidel/bash-magic/blob/main/retouch/retouch.sh) directly.
3. Make the bash file executable:
```bash
chmod +x ./retouch.sh
```
4. Optionally: create an executable symlink:
```bash
sudo ln -s "/path/to/retouch.sh" "/path/to/symlink"
# full example; assumes you are already in the shell file's location
sudo ln -s "$(pwd)/retouch.sh" "/usr/local/bin/retouch"
```
5. Use the script:
```bash
# shell file directly
./retouch.sh --source "/the/source/folder" --pattern "IMG.*\.MOV" --exifdata CreationDate
# symlink
retouch --source "/the/source/folder" --pattern "IMG.*\.MOV" --exifdata CreationDate
```

The `--source` folder is where your photos or videos are located. You can filter the files by a regex `--pattern` (use `".*"` if you do not need to filter anything). Finally, use the `--exifdata` parameter to define which EXIF `time` tag you want to use. In most cases `CreationDate` is the best option as it represents the localized time.

If you are unsure which EXIF `time` tag to use, have a look at the tags available with:

```bash
exiftool -time:ALL -d '%Y-%m-%d %H:%M:%S' "IMG_1.MOV"

> File Modification Date/Time  : 2022-09-28 19:03:13
> File Access Date/Time        : 2023-09-24 12:53:39
> File Inode Change Date/Time  : 2022-10-22 16:17:55
> Create Date                  : 2022-09-03 06:59:43
> Modify Date                  : 2022-09-03 07:00:19
> Track Create Date            : 2022-09-03 06:59:43
> Track Modify Date            : 2022-09-03 07:00:19
> Media Create Date            : 2022-09-03 06:59:43
> Media Modify Date            : 2022-09-03 07:00:19
> Creation Date                : 2022-09-03 08:59:43
```
