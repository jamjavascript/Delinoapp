from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.item import ItemCreate, ItemUpdate, ItemResponse

router = APIRouter()

# In-memory database for demo purposes
items_db: dict[int, dict] = {}
next_id = 1


@router.post("/items", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(item: ItemCreate):
    """
    Create a new item.
    """
    global next_id
    item_dict = item.model_dump()
    item_dict["id"] = next_id
    items_db[next_id] = item_dict
    next_id += 1
    return item_dict


@router.get("/items", response_model=List[ItemResponse])
async def get_items(skip: int = 0, limit: int = 100):
    """
    Retrieve all items with pagination.
    """
    items = list(items_db.values())
    return items[skip : skip + limit]


@router.get("/items/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int):
    """
    Retrieve a specific item by ID.
    """
    if item_id not in items_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found"
        )
    return items_db[item_id]


@router.put("/items/{item_id}", response_model=ItemResponse)
async def update_item(item_id: int, item_update: ItemUpdate):
    """
    Update an existing item.
    """
    if item_id not in items_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found"
        )

    stored_item = items_db[item_id]
    update_data = item_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        stored_item[field] = value

    items_db[item_id] = stored_item
    return stored_item


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: int):
    """
    Delete an item.
    """
    if item_id not in items_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found"
        )
    del items_db[item_id]
