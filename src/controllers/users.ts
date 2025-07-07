import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Build query
    const queryObj: Record<string, any> = {};
    
    // Apply filters with case-insensitive partial matching for all query parameters
    // Exclude pagination, sorting, and field selection parameters
    const excludedParams = ['page', 'limit', 'sort', 'fields'];
    
    Object.keys(req.query).forEach(param => {
      if (!excludedParams.includes(param)) {
        queryObj[param] = { $regex: req.query[param], $options: 'i' };
      }
    });

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await User.countDocuments(queryObj);

    // Sorting
    let sortBy = {};
    if (req.query.sort) {
      const sortFields = (req.query.sort as string).split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          // Descending order
          sortBy = { ...sortBy, [field.substring(1)]: -1 };
        } else {
          // Ascending order
          sortBy = { ...sortBy, [field]: 1 };
        }
      });
    } else {
      // Default sort by name ascending
      sortBy = { name: 1 };
    }

    // Field selection
    let select = '';
    if (req.query.fields) {
      select = (req.query.fields as string).split(',').join(' ');
    }

    // Query with pagination, filters, sorting, and field selection
    const users = await User.find(queryObj)
      .select(select)
      .sort(sortBy)
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination: {
      next?: { page: number; limit: number };
      prev?: { page: number; limit: number };
    } = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: users.length,
      pagination,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 */
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create user
 * @route   POST /api/v1/users
 * @access  Private/Admin
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/v1/users/:id
 * @access  Private/Admin
 */
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};