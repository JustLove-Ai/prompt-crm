'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export interface CategoryFormData {
  name: string
  description?: string
  color?: string
  icon?: string
  parentId?: string
}

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        prompts: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return { success: true, data: categories }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return { success: false, error: 'Failed to fetch categories' }
  }
}

export async function getCategoryById(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        prompts: true
      }
    })
    
    if (!category) {
      return { success: false, error: 'Category not found' }
    }
    
    return { success: true, data: category }
  } catch (error) {
    console.error('Failed to fetch category:', error)
    return { success: false, error: 'Failed to fetch category' }
  }
}

export async function createCategory(formData: CategoryFormData) {
  try {
    if (!formData.name) {
      return { success: false, error: 'Name is required' }
    }

    const category = await prisma.category.create({
      data: {
        name: formData.name,
        description: formData.description,
        color: formData.color || '#3b82f6',
        icon: formData.icon,
        parentId: formData.parentId || null
      },
      include: {
        parent: true,
        children: true,
        prompts: true
      }
    })

    revalidatePath('/categories')
    return { success: true, data: category }
  } catch (error) {
    console.error('Failed to create category:', error)
    return { success: false, error: 'Failed to create category' }
  }
}

export async function updateCategory(id: string, formData: CategoryFormData) {
  try {
    if (!formData.name) {
      return { success: false, error: 'Name is required' }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: formData.name,
        description: formData.description,
        color: formData.color,
        icon: formData.icon,
        parentId: formData.parentId || null
      },
      include: {
        parent: true,
        children: true,
        prompts: true
      }
    })

    revalidatePath('/categories')
    revalidatePath(`/categories/${id}`)
    return { success: true, data: category }
  } catch (error) {
    console.error('Failed to update category:', error)
    return { success: false, error: 'Failed to update category' }
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id }
    })

    revalidatePath('/categories')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete category:', error)
    return { success: false, error: 'Failed to delete category' }
  }
}

export async function redirectToCategory(id: string) {
  redirect(`/categories/${id}`)
}

export async function redirectToCategories() {
  redirect('/categories')
}